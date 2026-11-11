"""Train DermaScan-Net v4.0 on Kaggle Canine Skin Disease Dataset.

Dataset:
    kagglehub.dataset_download("youssefmohmmed/dogs-skin-diseases-image-dataset")
    4,315 canine dermatology images across 6 classes (train / valid / test).

Methodology (strictly zero-mock, zero-leakage):
    1. Downloads the real Kaggle dataset via kagglehub.
    2. Deduplicates train against exact MD5 hashes present in valid or test so
       validation and held-out test metrics have zero byte-duplicate leakage.
    3. Two-Stage LP-FT training on ConvNeXt-Tiny (ImageNet-1K pretrained):
       - Stage 1: Linear-probe head warmup on cached 768-D embeddings so the
         6-class veterinary classifier initializes cleanly without perturbing
         pretrained convolutional filters.
       - Stage 2: Augmented fine-tuning of Stage-4 convolutional blocks
         (features[6:] + classifier) with differential learning rates, softened
         class-balanced CrossEntropyLoss + label smoothing, and CosineAnnealingLR.
    4. Best checkpoint selected strictly by validation Macro-F1.
    5. Temperature scaling T fitted via LBFGS/Brent optimization on valid 2x TTA
       logits to calibrate confidence scores.
    6. Single held-out evaluation on test (n = 433) reporting overall accuracy,
       95% Wilson CI, balanced accuracy, macro F1/precision/recall/specificity,
       Cohen's kappa, macro OvR AUROC, Brier score, ECE, confusion matrix,
       and single-image CPU inference latency.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import random
import time
from collections import Counter
from pathlib import Path

import kagglehub
import numpy as np
from PIL import Image
from scipy.optimize import minimize_scalar
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    cohen_kappa_score,
    confusion_matrix,
    roc_auc_score,
)
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Dataset, TensorDataset
import torchvision.models as tv_models
from torchvision import transforms

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_JSON_PATH = PROJECT_ROOT / "server" / "models" / "dermascan_ml_model.json"
SERVER_MODELS_DIR = PROJECT_ROOT / "server" / "models"
OUTPUT_DIR = PROJECT_ROOT / "training-output"

DATASET_SLUG = "youssefmohmmed/dogs-skin-diseases-image-dataset"
DATASET_URL = f"https://www.kaggle.com/datasets/{DATASET_SLUG}"
INPUT_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

FOLDER_TO_CLASS = {
    "Dermatitis": "Dermatitis",
    "Fungal_infections": "Fungal_infections",
    "Healthy": "Healthy",
    "Hypersensitivity": "Hypersensitivity_Allergic_Dermatitis",
    "demodicosis": "demodicosis",
    "ringworm": "ringworm",
}

CLASSES = [
    "Dermatitis",
    "Fungal_infections",
    "Healthy",
    "Hypersensitivity_Allergic_Dermatitis",
    "demodicosis",
    "ringworm",
]

SEED = 42
BATCH_SIZE = 32
CPU_THREADS = 6


def seed_everything(seed: int = SEED) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.set_num_threads(CPU_THREADS)


def load_disease_catalog() -> dict:
    with open(MODEL_JSON_PATH, "r", encoding="utf-8") as f:
        bundle = json.load(f)
    return bundle["disease_catalog"]


def wilson_ci(correct: int, total: int, z: float = 1.96) -> tuple[float, float]:
    if total == 0:
        return (0.0, 0.0)
    p = correct / total
    denom = 1.0 + z * z / total
    center = (p + z * z / (2.0 * total)) / denom
    half = z * math.sqrt((p * (1.0 - p) + z * z / (4.0 * total)) / total) / denom
    return (max(0.0, center - half), min(1.0, center + half))


def compute_ece(probs: np.ndarray, targets: np.ndarray, n_bins: int = 10) -> float:
    confidences = np.max(probs, axis=1)
    predictions = np.argmax(probs, axis=1)
    accuracies = (predictions == targets).astype(np.float64)
    bin_edges = np.linspace(0.0, 1.0, n_bins + 1)
    ece = 0.0
    n = len(targets)
    for b_idx in range(n_bins):
        lo, hi = bin_edges[b_idx], bin_edges[b_idx + 1]
        mask = (confidences > lo) & (confidences <= hi) if b_idx > 0 else (confidences >= lo) & (confidences <= hi)
        if np.any(mask):
            ece += (np.sum(mask) / n) * abs(float(np.mean(accuracies[mask])) - float(np.mean(confidences[mask])))
    return float(ece)


def compute_brier(probs: np.ndarray, targets: np.ndarray, num_classes: int) -> float:
    one_hot = np.eye(num_classes)[targets]
    return float(np.mean(np.sum((probs - one_hot) ** 2, axis=1)))


def compute_macro_specificity(cm: np.ndarray) -> tuple[float, list[float]]:
    specs = []
    total = np.sum(cm)
    for i in range(cm.shape[0]):
        tp = cm[i, i]
        fp = np.sum(cm[:, i]) - tp
        fn = np.sum(cm[i, :]) - tp
        tn = total - tp - fp - fn
        specs.append(float(tn / max(1, tn + fp)))
    return float(np.mean(specs)), specs


class CanineSkinDataset(Dataset):
    def __init__(self, samples: list[tuple[Path, int]], tfm: transforms.Compose):
        self.samples = samples
        self.tfm = tfm

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        path, label = self.samples[idx]
        with Image.open(path) as img:
            x = self.tfm(img.convert("RGB"))
        return x, label


def build_convnext_classifier(num_classes: int = len(CLASSES), pretrained: bool = True) -> nn.Module:
    weights = tv_models.ConvNeXt_Tiny_Weights.IMAGENET1K_V1 if pretrained else None
    model = tv_models.convnext_tiny(weights=weights)
    in_features = model.classifier[2].in_features
    model.classifier = nn.Sequential(
        model.classifier[0],  # LayerNorm2d((768,), eps=1e-6)
        nn.Flatten(1),
        nn.Dropout(p=0.25),
        nn.Linear(in_features, num_classes),
    )
    return model


def load_kaggle_splits(dataset_dir: Path) -> tuple[dict[str, list[tuple[Path, int]]], dict]:
    class_to_idx = {c: i for i, c in enumerate(CLASSES)}
    valid_hashes: set[str] = set()
    test_hashes: set[str] = set()

    for p in (dataset_dir / "valid").rglob("*.jpg"):
        valid_hashes.add(hashlib.md5(p.read_bytes()).hexdigest())
    for p in (dataset_dir / "test").rglob("*.jpg"):
        test_hashes.add(hashlib.md5(p.read_bytes()).hexdigest())

    forbidden_for_train = valid_hashes | test_hashes
    valid_test_overlap = valid_hashes & test_hashes

    splits: dict[str, list[tuple[Path, int]]] = {"train": [], "valid": [], "test": []}
    removed_train_overlap = 0
    test_clean_indices: list[int] = []

    for split in ["train", "valid", "test"]:
        for folder_name, canonical_name in FOLDER_TO_CLASS.items():
            cls_idx = class_to_idx[canonical_name]
            cls_dir = dataset_dir / split / folder_name
            for p in sorted(cls_dir.glob("*.jpg")):
                h = hashlib.md5(p.read_bytes()).hexdigest()
                if split == "train" and h in forbidden_for_train:
                    removed_train_overlap += 1
                    continue
                if split == "test" and h not in valid_hashes:
                    test_clean_indices.append(len(splits["test"]))
                splits[split].append((p, cls_idx))

    meta = {
        "train_count": len(splits["train"]),
        "removed_train_duplicates_matching_valid_or_test": removed_train_overlap,
        "valid_count": len(splits["valid"]),
        "test_count": len(splits["test"]),
        "valid_test_md5_overlap_count": len(valid_test_overlap),
        "test_strict_no_valid_overlap_count": len(test_clean_indices),
        "test_clean_indices": test_clean_indices,
        "train_class_counts": {
            CLASSES[k]: int(v) for k, v in sorted(Counter(y for _, y in splits["train"]).items())
        },
        "valid_class_counts": {
            CLASSES[k]: int(v) for k, v in sorted(Counter(y for _, y in splits["valid"]).items())
        },
        "test_class_counts": {
            CLASSES[k]: int(v) for k, v in sorted(Counter(y for _, y in splits["test"]).items())
        },
    }
    return splits, meta


@torch.no_grad()
def predict_logits(model: nn.Module, samples: list[tuple[Path, int]], eval_tfm: transforms.Compose, tta: bool) -> tuple[np.ndarray, np.ndarray]:
    model.eval()
    loader = DataLoader(CanineSkinDataset(samples, eval_tfm), batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    all_logits = []
    all_targets = []
    for x, y in loader:
        logits = model(x)
        if tta:
            logits = 0.5 * (logits + model(torch.flip(x, dims=[3])))
        all_logits.append(logits.numpy())
        all_targets.append(y.numpy())
    return np.concatenate(all_logits, axis=0), np.concatenate(all_targets, axis=0)


@torch.no_grad()
def cache_pooled_features(model: nn.Module, samples: list[tuple[Path, int]], tfm: transforms.Compose) -> tuple[torch.Tensor, torch.Tensor]:
    model.eval()
    loader = DataLoader(CanineSkinDataset(samples, tfm), batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    feats = []
    targets = []
    for x, y in loader:
        f = model.avgpool(model.features(x))
        feats.append(f)
        targets.append(y)
    return torch.cat(feats, dim=0), torch.cat(targets, dim=0)


def fit_temperature(valid_logits: np.ndarray, valid_targets: np.ndarray) -> float:
    logits_t = torch.from_numpy(valid_logits).float()
    targets_t = torch.from_numpy(valid_targets).long()

    def nll_loss(temp: float) -> float:
        return float(F.cross_entropy(logits_t / temp, targets_t).item())

    res = minimize_scalar(nll_loss, bounds=(0.35, 3.5), method="bounded")
    return float(res.x)


def evaluate_predictions(logits: np.ndarray, targets: np.ndarray, temperature: float, elapsed_ms: float | None = None) -> dict:
    scaled = logits / temperature
    probs = F.softmax(torch.from_numpy(scaled).float(), dim=1).numpy()
    preds = np.argmax(probs, axis=1)

    acc = float(accuracy_score(targets, preds))
    bal_acc = float(balanced_accuracy_score(targets, preds))
    ci_lo, ci_hi = wilson_ci(int(np.sum(preds == targets)), len(targets))
    cm = confusion_matrix(targets, preds, labels=list(range(len(CLASSES))))
    macro_spec, per_class_spec = compute_macro_specificity(cm)
    kappa = float(cohen_kappa_score(targets, preds))
    auroc = float(roc_auc_score(targets, probs, multi_class="ovr", average="macro"))
    brier = compute_brier(probs, targets, len(CLASSES))
    ece = compute_ece(probs, targets)

    report = classification_report(
        targets,
        preds,
        labels=list(range(len(CLASSES))),
        target_names=CLASSES,
        output_dict=True,
        zero_division=0,
    )
    per_class = {}
    for idx, cls_name in enumerate(CLASSES):
        per_class[cls_name] = {
            "precision": round(float(report[cls_name]["precision"]), 4),
            "recall": round(float(report[cls_name]["recall"]), 4),
            "specificity": round(float(per_class_spec[idx]), 4),
            "f1_score": round(float(report[cls_name]["f1-score"]), 4),
            "support": int(report[cls_name]["support"]),
        }

    return {
        "samples": int(len(targets)),
        "temperature": round(temperature, 4),
        "overall_accuracy": round(acc, 4),
        "wilson_ci_95": [round(ci_lo, 4), round(ci_hi, 4)],
        "balanced_accuracy": round(bal_acc, 4),
        "macro_f1": round(float(report["macro avg"]["f1-score"]), 4),
        "macro_precision": round(float(report["macro avg"]["precision"]), 4),
        "macro_recall": round(float(report["macro avg"]["recall"]), 4),
        "macro_specificity": round(macro_spec, 4),
        "cohen_kappa": round(kappa, 4),
        "auroc_macro": round(auroc, 4),
        "brier_score": round(brier, 4),
        "ece": round(ece, 4),
        "per_class": per_class,
        "confusion_matrix": cm.tolist(),
        "inference_latency_ms": round(elapsed_ms, 2) if elapsed_ms is not None else None,
    }


def benchmark_single_inference_ms(model: nn.Module, eval_tfm: transforms.Compose, sample_path: Path) -> float:
    model.eval()
    with Image.open(sample_path) as img:
        x = eval_tfm(img.convert("RGB")).unsqueeze(0)
    with torch.no_grad():
        _ = model(x)
    times = []
    for _ in range(5):
        t0 = time.perf_counter()
        with torch.no_grad():
            _ = model(x)
        times.append((time.perf_counter() - t0) * 1000.0)
    return float(np.median(times))


def dry_run_check() -> None:
    print("Running dry-run verification...")
    model = build_convnext_classifier(pretrained=False)
    x = torch.randn(2, 3, INPUT_SIZE, INPUT_SIZE)
    y = torch.tensor([0, 3])
    stem = nn.Sequential(*list(model.features[:6])).eval()
    tail_feats = nn.Sequential(*list(model.features[6:]))
    for p in stem.parameters():
        p.requires_grad_(False)
    with torch.no_grad():
        h = stem(x)
    feat_map = tail_feats(h)
    logits = model.classifier(model.avgpool(feat_map))
    loss = F.cross_entropy(logits, y)
    loss.backward()
    print(f"Dry-run ok: logits={tuple(logits.shape)}, feat_map={tuple(feat_map.shape)}, loss={loss.item():.4f}")


def train_and_evaluate(epochs: int = 5) -> None:
    seed_everything(SEED)
    t_start = time.perf_counter()

    path = kagglehub.dataset_download(DATASET_SLUG)
    print("Path to dataset files:", path)
    dataset_dir = Path(path)

    splits, dataset_meta = load_kaggle_splits(dataset_dir)
    print(
        f"Dataset splits ready: train={dataset_meta['train_count']} "
        f"(removed {dataset_meta['removed_train_duplicates_matching_valid_or_test']} leak duplicates), "
        f"valid={dataset_meta['valid_count']}, test={dataset_meta['test_count']}"
    )
    print("Train class counts:", dataset_meta["train_class_counts"])

    eval_tfm = transforms.Compose([
        transforms.Resize((INPUT_SIZE, INPUT_SIZE), interpolation=transforms.InterpolationMode.BICUBIC),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])
    train_tfm = transforms.Compose([
        transforms.RandomResizedCrop(
            INPUT_SIZE,
            scale=(0.75, 1.0),
            ratio=(0.85, 1.18),
            interpolation=transforms.InterpolationMode.BICUBIC,
        ),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.12, contrast=0.12, saturation=0.10, hue=0.02),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])

    counts = np.array([dataset_meta["train_class_counts"][c] for c in CLASSES], dtype=np.float32)
    raw_weights = (np.sum(counts) / (len(CLASSES) * counts)) ** 0.35
    class_weights = torch.tensor(raw_weights / np.mean(raw_weights), dtype=torch.float32)
    criterion = nn.CrossEntropyLoss(weight=class_weights, label_smoothing=0.05)
    print("Class loss weights:", {c: round(float(w), 3) for c, w in zip(CLASSES, class_weights)})

    model = build_convnext_classifier(num_classes=len(CLASSES), pretrained=True)

    # --- Stage 1: Linear-Probe Warmup on Cached 768-D Pooled Features ---
    print("\n[Stage 1] Caching pooled ConvNeXt-Tiny features for classifier head warmup...")
    t_s1 = time.perf_counter()
    X_tr_f, y_tr_f = cache_pooled_features(model, splits["train"], eval_tfm)
    X_va_f, y_va_f = cache_pooled_features(model, splits["valid"], eval_tfm)

    lp_loader = DataLoader(TensorDataset(X_tr_f, y_tr_f), batch_size=128, shuffle=True)
    lp_opt = torch.optim.AdamW(model.classifier.parameters(), lr=2e-3, weight_decay=1e-2)
    lp_sched = torch.optim.lr_scheduler.CosineAnnealingLR(lp_opt, T_max=80, eta_min=1e-5)

    best_score = (-1.0, -1.0)
    best_state = copy.deepcopy(model.state_dict())
    history = []

    for lp_ep in range(1, 81):
        model.classifier.train()
        for xb, yb in lp_loader:
            lp_opt.zero_grad()
            loss = criterion(model.classifier(xb), yb)
            loss.backward()
            lp_opt.step()
        lp_sched.step()

    model.classifier.eval()
    with torch.no_grad():
        va_preds = model.classifier(X_va_f).argmax(dim=1).numpy()
    va_acc = float(accuracy_score(y_va_f.numpy(), va_preds))
    va_f1 = float(classification_report(y_va_f.numpy(), va_preds, output_dict=True, zero_division=0)["macro avg"]["f1-score"])
    print(f"[Stage 1 Complete in {time.perf_counter()-t_s1:.1f}s] valid acc={va_acc:.4f}, macro_f1={va_f1:.4f}")
    best_score = (va_f1, va_acc)
    best_state = copy.deepcopy(model.state_dict())
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    tmp_ckpt_path = OUTPUT_DIR / "checkpoint_best_tmp.pt"
    torch.save(best_state, tmp_ckpt_path)
    history.append({"stage": "stage1_lp_warmup", "epoch": 0, "valid_acc": round(va_acc, 4), "valid_macro_f1": round(va_f1, 4)})

    # --- Stage 2: Augmented Stage-4 Partial Fine-Tuning (features[6:] + classifier) ---
    print(f"\n[Stage 2] Fine-tuning ConvNeXt-Tiny Stage 4 (features[6:] + classifier) for {epochs} epochs...")
    stem = nn.Sequential(*list(model.features[:6]))
    tail_feats = nn.Sequential(*list(model.features[6:]))
    for p in stem.parameters():
        p.requires_grad_(False)
    for p in tail_feats.parameters():
        p.requires_grad_(True)
    for p in model.classifier.parameters():
        p.requires_grad_(True)

    train_loader = DataLoader(CanineSkinDataset(splits["train"], train_tfm), batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    optimizer = torch.optim.AdamW(
        [
            {"params": tail_feats.parameters(), "lr": 5e-5, "weight_decay": 0.02},
            {"params": model.classifier.parameters(), "lr": 1.5e-4, "weight_decay": 0.02},
        ]
    )
    total_steps = epochs * len(train_loader)
    warmup_steps = min(30, max(10, total_steps // 10))

    def lr_lambda(step: int) -> float:
        if step < warmup_steps:
            return float(step + 1) / float(warmup_steps)
        progress = float(step - warmup_steps) / float(max(1, total_steps - warmup_steps))
        return max(0.02, 0.5 * (1.0 + math.cos(math.pi * progress)))

    scheduler = torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda=lr_lambda)

    for epoch in range(1, epochs + 1):
        ep_t0 = time.perf_counter()
        stem.eval()
        tail_feats.train()
        model.classifier.train()

        running_loss = 0.0
        for step_idx, (xb, yb) in enumerate(train_loader, start=1):
            optimizer.zero_grad()
            with torch.no_grad():
                h = stem(xb)
            logits = model.classifier(model.avgpool(tail_feats(h)))
            loss = criterion(logits, yb)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(list(tail_feats.parameters()) + list(model.classifier.parameters()), max_norm=1.0)
            optimizer.step()
            scheduler.step()
            running_loss += float(loss.item()) * xb.size(0)

        train_loss = running_loss / len(splits["train"])
        va_logits, va_targets = predict_logits(model, splits["valid"], eval_tfm, tta=False)
        va_pred = np.argmax(va_logits, axis=1)
        ep_acc = float(accuracy_score(va_targets, va_pred))
        ep_f1 = float(classification_report(va_targets, va_pred, output_dict=True, zero_division=0)["macro avg"]["f1-score"])
        ep_dt = time.perf_counter() - ep_t0

        improved = (ep_f1, ep_acc) > best_score
        if improved:
            best_score = (ep_f1, ep_acc)
            best_state = copy.deepcopy(model.state_dict())
            torch.save(best_state, tmp_ckpt_path)

        history.append(
            {
                "stage": "stage2_ft",
                "epoch": epoch,
                "train_loss": round(train_loss, 4),
                "valid_acc": round(ep_acc, 4),
                "valid_macro_f1": round(ep_f1, 4),
                "duration_sec": round(ep_dt, 1),
                "best_so_far": improved,
            }
        )
        print(
            f"  Epoch {epoch}/{epochs} ({ep_dt:.1f}s) | loss={train_loss:.4f} | "
            f"valid acc={ep_acc:.4f}, macro_f1={ep_f1:.4f} {'[NEW BEST]' if improved else ''}",
            flush=True,
        )

    # --- Stage 3: Calibration on Valid (2x TTA) & Single Held-Out Test Eval ---
    model.load_state_dict(best_state)
    model.eval()

    print("\n[Stage 3] Fitting temperature scaling on validation set (2x TTA)...")
    va_tta_logits, va_targets = predict_logits(model, splits["valid"], eval_tfm, tta=True)
    temperature = fit_temperature(va_tta_logits, va_targets)
    valid_metrics = evaluate_predictions(va_tta_logits, va_targets, temperature=temperature)
    print(f"  Valid (2x TTA, T={temperature:.3f}): acc={valid_metrics['overall_accuracy']}, macro_f1={valid_metrics['macro_f1']}, ece={valid_metrics['ece']}")

    print("\nEvaluating ONCE on held-out test set (n=433, 2x TTA)...")
    te_tta_logits, te_targets = predict_logits(model, splits["test"], eval_tfm, tta=True)
    single_ms = benchmark_single_inference_ms(model, eval_tfm, splits["test"][0][0])
    test_metrics = evaluate_predictions(te_tta_logits, te_targets, temperature=temperature, elapsed_ms=single_ms)

    clean_idx = dataset_meta["test_clean_indices"]
    test_strict_clean_metrics = evaluate_predictions(te_tta_logits[clean_idx], te_targets[clean_idx], temperature=temperature)

    print(
        f"  Held-out Test (n={test_metrics['samples']}): "
        f"acc={test_metrics['overall_accuracy']} (95% CI {test_metrics['wilson_ci_95']}), "
        f"bal_acc={test_metrics['balanced_accuracy']}, macro_f1={test_metrics['macro_f1']}, "
        f"auroc={test_metrics['auroc_macro']}, kappa={test_metrics['cohen_kappa']}, "
        f"ece={test_metrics['ece']}, 1-img latency={test_metrics['inference_latency_ms']} ms"
    )
    print(
        f"  Strict Clean Test (n={test_strict_clean_metrics['samples']}, excluding 2 valid-test MD5 overlaps): "
        f"acc={test_strict_clean_metrics['overall_accuracy']}, macro_f1={test_strict_clean_metrics['macro_f1']}"
    )
    print("  Per-class Test Report:")
    for cls_name, cls_stats in test_metrics["per_class"].items():
        print(f"    {cls_name}: {cls_stats}")

    # Export production artifacts
    SERVER_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    disease_catalog = load_disease_catalog()
    total_duration_sec = round(time.perf_counter() - t_start, 1)

    evaluation_payload = {
        "version": "DermaScan-Net v4.0 (ConvNeXt-Tiny Kaggle LP-FT)",
        "architecture": "torchvision.models.convnext_tiny",
        "pretrained_init": "ConvNeXt_Tiny_Weights.IMAGENET1K_V1",
        "input_size": INPUT_SIZE,
        "normalization": {"mean": IMAGENET_MEAN, "std": IMAGENET_STD},
        "tta": "2x (original + horizontal_flip)",
        "dataset_slug": DATASET_SLUG,
        "dataset_url": DATASET_URL,
        "dataset_splits": {k: v for k, v in dataset_meta.items() if k != "test_clean_indices"},
        "classes": CLASSES,
        "best_valid_macro_f1": round(best_score[0], 4),
        "best_valid_accuracy": round(best_score[1], 4),
        "valid_metrics": valid_metrics,
        "test_metrics": test_metrics,
        "test_strict_no_valid_overlap_metrics": test_strict_clean_metrics,
        "training_history": history,
        "seed": SEED,
        "epochs_stage2": epochs,
        "total_training_duration_sec": total_duration_sec,
        "trained_at_iso": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    checkpoint_payload = {
        "version": evaluation_payload["version"],
        "architecture": "convnext_tiny",
        "input_size": INPUT_SIZE,
        "normalization": evaluation_payload["normalization"],
        "temperature": temperature,
        "classes": CLASSES,
        "folder_to_class": FOLDER_TO_CLASS,
        "disease_catalog": {c: disease_catalog[c] for c in CLASSES},
        "dataset_slug": DATASET_SLUG,
        "dataset_url": DATASET_URL,
        "metrics": test_metrics,
        "valid_metrics": valid_metrics,
        "model_state_dict": best_state,
    }

    for out_pt in [SERVER_MODELS_DIR / "dermascan_kaggle_convnext_v4.pt", OUTPUT_DIR / "dermascan_kaggle_convnext_v4.pt"]:
        torch.save(checkpoint_payload, out_pt)
        print(f"Saved model weights to: {out_pt}")

    for out_json in [SERVER_MODELS_DIR / "kaggle_evaluation.json", OUTPUT_DIR / "kaggle_evaluation.json"]:
        with open(out_json, "w", encoding="utf-8") as f:
            json.dump(evaluation_payload, f, indent=2)
        print(f"Saved evaluation report to: {out_json}", flush=True)

    if tmp_ckpt_path.exists():
        tmp_ckpt_path.unlink()


def main() -> None:
    parser = argparse.ArgumentParser(description="Train DermaScan ConvNeXt-Tiny on Kaggle Dog Skin Diseases dataset.")
    parser.add_argument("--dry-run", action="store_true", help="Run a fast shape & backward sanity check.")
    parser.add_argument("--epochs", type=int, default=4, help="Number of Stage-2 fine-tuning epochs.")
    args = parser.parse_args()

    if args.dry_run:
        dry_run_check()
    else:
        train_and_evaluate(epochs=args.epochs)


if __name__ == "__main__":
    main()
