"""Train a research-only dog skin image classifier from the cited CC BY dataset.

This artifact is not a diagnostic model and must not be used for customer care.
It uses one standard RGB image (pic0.jpg) per case, groups cross-validation by
case folder, and freezes ImageNet ResNet18 embeddings to reduce overfitting.
"""

from __future__ import annotations

import argparse
import json
import random
import zipfile
from collections import Counter
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageDraw
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, balanced_accuracy_score,
                             classification_report, confusion_matrix,
                             f1_score)
from sklearn.model_selection import StratifiedGroupKFold
from torchvision.models import ResNet18_Weights, resnet18


DATASET_DOI = "10.17632/5dbht54kw7.1"
DATASET_URL = "https://data.mendeley.com/datasets/5dbht54kw7/1"
LABELS = {
    "Bacterial_dermatosis": "bacterial_dermatosis",
    "Fungal_infections": "fungal_infection",
    "Hypersensitivity_allergic_dermatosis": "allergic_dermatosis",
    "Healthy": "healthy",
}
SEED = 42


def collect_cases(archive: Path) -> list[dict[str, str]]:
    with zipfile.ZipFile(archive) as bundle:
        label_path = next(name for name in bundle.namelist() if name.endswith("/image_label.txt"))
        labels = {}
        for line in bundle.read(label_path).decode("utf-8-sig").splitlines():
            fields = line.strip().split()
            if len(fields) >= 2:
                labels[fields[0].lower()] = LABELS.get("_".join(fields[1:]))
        cases = []
        for name in bundle.namelist():
            if name.lower().endswith("/pic0.jpg"):
                case_id = name.split("/")[-2]
                label = labels.get(case_id.lower())
                if label:
                    cases.append({"case_id": case_id, "label": label, "image": name})
    if not cases:
        raise ValueError("No labeled pic0.jpg images found. Check the dataset archive format.")
    return sorted(cases, key=lambda item: item["case_id"].lower())


def load_rgb_images(archive: Path, cases: list[dict[str, str]]) -> list[Image.Image]:
    with zipfile.ZipFile(archive) as bundle:
        return [Image.open(bundle.open(case["image"])).convert("RGB") for case in cases]


def inspect(archive: Path, cases: list[dict[str, str]], output: Path) -> None:
    images = load_rgb_images(archive, cases)
    counts = Counter(case["label"] for case in cases)
    sheet = Image.new("RGB", (4 * 240, ((len(cases) + 3) // 4) * 215), "white")
    draw = ImageDraw.Draw(sheet)
    for index, (case, image) in enumerate(zip(cases, images)):
        image.thumbnail((232, 184))
        x, y = (index % 4) * 240, (index // 4) * 215
        sheet.paste(image, (x + 4, y + 3))
        draw.text((x + 4, y + 189), f"{case['label']} · {case['case_id']}", fill="black")
    output.mkdir(parents=True, exist_ok=True)
    sheet.save(output / "pic0_contact_sheet.jpg", quality=85)
    print(json.dumps({
        "cases": len(cases),
        "source_dataset_cases_reported_by_paper": 95,
        "labeled_cases_available_in_archive": len(cases),
        "unlabeled_case_folders_excluded": 95 - len(cases),
        "class_counts": dict(sorted(counts.items())),
        "sample_sizes": [image.size for image in images[:5]],
        "contact_sheet": str(output / "pic0_contact_sheet.jpg"),
    }, indent=2))


def extract_embeddings(images: list[Image.Image], batch_size: int = 8) -> np.ndarray:
    torch.manual_seed(SEED)
    torch.set_num_threads(min(6, torch.get_num_threads()))
    weights = ResNet18_Weights.DEFAULT
    preprocess = weights.transforms()
    encoder = resnet18(weights=weights)
    encoder.fc = torch.nn.Identity()
    encoder.eval()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    encoder.to(device)
    outputs = []
    with torch.inference_mode():
        for start in range(0, len(images), batch_size):
            batch = torch.stack([preprocess(image) for image in images[start:start + batch_size]])
            outputs.append(encoder(batch.to(device)).cpu().numpy())
    print(f"Feature extractor device: {device}")
    return np.concatenate(outputs, axis=0)


def train(archive: Path, output: Path, folds: int) -> None:
    random.seed(SEED)
    np.random.seed(SEED)
    output.mkdir(parents=True, exist_ok=True)
    cases = collect_cases(archive)
    images = load_rgb_images(archive, cases)
    labels = np.asarray([case["label"] for case in cases])
    groups = np.asarray([case["case_id"] for case in cases])
    classes = sorted(set(labels))
    if min(Counter(labels).values()) < folds:
        raise ValueError(f"Each class needs at least {folds} cases for stratified cross-validation.")

    features = extract_embeddings(images)
    cv = StratifiedGroupKFold(n_splits=folds, shuffle=True, random_state=SEED)
    predictions = np.empty(labels.shape, dtype=object)
    for train_indices, test_indices in cv.split(features, labels, groups):
        classifier = LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            random_state=SEED,
        )
        classifier.fit(features[train_indices], labels[train_indices])
        predictions[test_indices] = classifier.predict(features[test_indices])

    report = {
        "status": "research_only_not_for_customer_or_clinical_use",
        "dataset": DATASET_URL,
        "dataset_doi": DATASET_DOI,
        "dataset_license": "CC BY 4.0; cite Hwang et al. (2022), DOI 10.17632/5dbht54kw7.1",
        "input_images": "one standard RGB pic0.jpg image per case folder; multispectral images excluded",
        "cases": len(cases),
        "source_dataset_cases_reported_by_paper": 95,
        "labeled_cases_available_in_archive": len(cases),
        "unlabeled_case_folders_excluded": 95 - len(cases),
        "case_grouped_folds": folds,
        "seed": SEED,
        "feature_extractor": "ImageNet pretrained ResNet18 (frozen); logistic regression head",
        "class_counts": dict(sorted(Counter(labels).items())),
        "accuracy": float(accuracy_score(labels, predictions)),
        "balanced_accuracy": float(balanced_accuracy_score(labels, predictions)),
        "macro_f1": float(f1_score(labels, predictions, average="macro")),
        "majority_class_baseline_accuracy": float(max(Counter(labels).values()) / len(labels)),
        "classes": classes,
        "confusion_matrix_rows_true_cols_predicted": confusion_matrix(labels, predictions, labels=classes).tolist(),
        "per_class_report": classification_report(labels, predictions, labels=classes, output_dict=True, zero_division=0),
        "limitations": [
            "The source paper reports 95 dogs, but this archive contains labels for only 62 case folders; unlabeled folders were excluded.",
            "Class-specific samples in this training run range from 11 to 26; estimates are unstable.",
            "Cross-validation is internal to one small dataset and is not external validation.",
            "Images and labels reflect one study/site and may not represent customer phone photos or other regions.",
            "The classes are broad study labels, not confirmed diagnoses for new animals.",
            "This prototype is dog-only and must not be used to guide treatment or urgent-care decisions.",
        ],
    }
    estimator = LogisticRegression(max_iter=2000, class_weight="balanced", random_state=SEED)
    estimator.fit(features, labels)
    import joblib
    joblib.dump({
        "classifier": estimator,
        "label_names": classes,
        "feature_extractor": "torchvision resnet18 weights=DEFAULT, frozen, ImageNet normalization",
        "input_size": 224,
        "source_dataset": DATASET_DOI,
        "research_only": True,
    }, output / "dog_skin_research_classifier.joblib")
    (output / "evaluation.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({
        "model": str(output / "dog_skin_research_classifier.joblib"),
        "evaluation": str(output / "evaluation.json"),
        "cases": report["cases"],
        "class_counts": report["class_counts"],
        "accuracy": report["accuracy"],
        "balanced_accuracy": report["balanced_accuracy"],
        "macro_f1": report["macro_f1"],
    }, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, default=Path("training-data/dog_skin_dataset.zip"))
    parser.add_argument("--output", type=Path, default=Path("training-output"))
    parser.add_argument("--inspect-only", action="store_true")
    parser.add_argument("--folds", type=int, default=5)
    args = parser.parse_args()
    cases = collect_cases(args.archive)
    if args.inspect_only:
        inspect(args.archive, cases, args.output)
    else:
        train(args.archive, args.output, args.folds)


if __name__ == "__main__":
    main()
