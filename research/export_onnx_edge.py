"""Export DermaScan-Net v4.0 ConvNeXt-Tiny checkpoint to quantized INT8 ONNX + Edge CAM metadata.

Produces:
  - public/models/dermascan_convnext_v4_int8.onnx
  - public/models/dermascan_v4_meta.json

Evaluates the exported INT8 ONNX model on the held-out Kaggle test split (n = 433)
with 2x TTA and checkpoint-calibrated temperature scaling to record exact metrics.
"""

from __future__ import annotations

import json
import shutil
import tempfile
import time
from pathlib import Path

import numpy as np
import onnx
import onnxruntime as ort
from onnxruntime.quantization import QuantType, quantize_dynamic
from onnxruntime.quantization.shape_inference import quant_pre_process
from PIL import Image
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as tv_models
from torchvision import transforms

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CKPT_PATH = PROJECT_ROOT / "server" / "models" / "dermascan_kaggle_convnext_v4.pt"
EVAL_JSON_PATH = PROJECT_ROOT / "server" / "models" / "kaggle_evaluation.json"
OUT_MODELS_DIR = PROJECT_ROOT / "public" / "models"
ONNX_OUT_PATH = OUT_MODELS_DIR / "dermascan_convnext_v4_int8.onnx"
META_OUT_PATH = OUT_MODELS_DIR / "dermascan_v4_meta.json"

KAGGLE_DIR = Path(
    r"C:\Users\prana\.cache\kagglehub\datasets\youssefmohmmed\dogs-skin-diseases-image-dataset\versions\1"
)
FOLDER_TO_CLASS = {
    "Dermatitis": "Dermatitis",
    "Fungal_infections": "Fungal_infections",
    "Healthy": "Healthy",
    "Hypersensitivity": "Hypersensitivity_Allergic_Dermatitis",
    "demodicosis": "demodicosis",
    "ringworm": "ringworm",
}


class ConvNeXtDualOutput(nn.Module):
    """Exports logits [B, 6] alongside Stage-4 spatial feature maps [B, 768, 7, 7]."""

    def __init__(self, base_model: nn.Module):
        super().__init__()
        self.features = base_model.features
        self.avgpool = base_model.avgpool
        self.classifier = base_model.classifier

    def forward(self, x: torch.Tensor):
        feat_map = self.features(x)
        logits = self.classifier(self.avgpool(feat_map))
        return logits, feat_map


def evaluate_onnx(onnx_path: Path, classes: list[str], norm: dict, temperature: float) -> dict | None:
    test_dir = KAGGLE_DIR / "test"
    if not test_dir.exists():
        return None

    tfm = transforms.Compose([
        transforms.Resize((224, 224), interpolation=transforms.InterpolationMode.BICUBIC),
        transforms.ToTensor(),
        transforms.Normalize(norm["mean"], norm["std"]),
    ])
    class_to_idx = {c: i for i, c in enumerate(classes)}
    samples = [
        (p, class_to_idx[cls_name])
        for folder, cls_name in FOLDER_TO_CLASS.items()
        for p in sorted((test_dir / folder).glob("*.jpg"))
    ]

    sess = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    probs_all = []
    targets_all = []
    latencies = []

    for img_path, target_idx in samples:
        with Image.open(img_path) as im:
            x = tfm(im.convert("RGB")).unsqueeze(0).numpy()
        x_flip = x[:, :, :, ::-1].copy()

        t0 = time.perf_counter()
        logits_orig, _ = sess.run(None, {"image": x})
        logits_flip, _ = sess.run(None, {"image": x_flip})
        avg_logits = 0.5 * (logits_orig + logits_flip)
        prob_vec = F.softmax(torch.from_numpy(avg_logits) / temperature, dim=1).squeeze(0).numpy()
        latencies.append((time.perf_counter() - t0) * 1000.0)

        probs_all.append(prob_vec)
        targets_all.append(target_idx)

    probs_np = np.asarray(probs_all, dtype=np.float64)
    targets_np = np.asarray(targets_all, dtype=np.int64)
    preds_np = np.argmax(probs_np, axis=1)

    return {
        "samples": int(len(targets_np)),
        "overall_accuracy": round(float(accuracy_score(targets_np, preds_np)), 4),
        "macro_f1": round(float(f1_score(targets_np, preds_np, average="macro")), 4),
        "auroc_macro": round(float(roc_auc_score(targets_np, probs_np, multi_class="ovr", average="macro")), 4),
        "median_cpu_latency_ms": round(float(np.median(latencies)), 1),
    }


def main() -> None:
    if not CKPT_PATH.exists():
        raise FileNotFoundError(f"Checkpoint not found: {CKPT_PATH}")

    OUT_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    ckpt = torch.load(CKPT_PATH, map_location="cpu", weights_only=False)
    classes: list[str] = ckpt["classes"]
    norm: dict = ckpt.get("normalization", {"mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225]})
    temperature: float = float(ckpt.get("temperature", 1.0))

    base = tv_models.convnext_tiny(weights=None)
    in_features = base.classifier[2].in_features
    base.classifier = nn.Sequential(
        base.classifier[0],
        nn.Flatten(1),
        nn.Dropout(p=0.25),
        nn.Linear(in_features, len(classes)),
    )
    base.load_state_dict(ckpt["model_state_dict"], strict=True)
    base.eval()

    dual = ConvNeXtDualOutput(base)
    dual.eval()

    with tempfile.TemporaryDirectory() as tmpdir_str:
        tmpdir = Path(tmpdir_str)
        fp32_path = tmpdir / "convnext_fp32.onnx"
        prep_path = tmpdir / "convnext_prep.onnx"

        dummy = torch.randn(1, 3, 224, 224)
        torch.onnx.export(
            dual,
            dummy,
            str(fp32_path),
            input_names=["image"],
            output_names=["logits", "feat_map"],
            opset_version=18,
            dynamo=False,
        )
        loaded = onnx.load(str(fp32_path), load_external_data=True)
        onnx.save_model(loaded, str(fp32_path), save_as_external_data=False)

        quant_pre_process(str(fp32_path), str(prep_path), skip_symbolic_shape=False)
        quantize_dynamic(
            model_input=str(prep_path),
            model_output=str(ONNX_OUT_PATH),
            per_channel=True,
            weight_type=QuantType.QInt8,
        )

    edge_metrics = evaluate_onnx(ONNX_OUT_PATH, classes, norm, temperature)
    eval_summary = {}
    if EVAL_JSON_PATH.exists():
        eval_summary = json.loads(EVAL_JSON_PATH.read_text(encoding="utf-8"))

    # Extract exact LayerNorm2d + Linear parameters so browser computes Stage-4 CAM identically to Grad-CAM
    ln_weight = base.classifier[0].weight.detach().numpy().round(6).tolist()
    ln_bias = base.classifier[0].bias.detach().numpy().round(6).tolist()
    linear_weight = base.classifier[3].weight.detach().numpy().round(6).tolist()
    linear_bias = base.classifier[3].bias.detach().numpy().round(6).tolist()

    size_mb = round(ONNX_OUT_PATH.stat().st_size / (1024 * 1024), 2)
    meta = {
        "version": ckpt.get("version", "DermaScan-Net v4.0 (ConvNeXt-Tiny Kaggle LP-FT)"),
        "architecture": "torchvision.models.convnext_tiny (INT8 ONNX Edge)",
        "datasetSlug": ckpt.get("dataset_slug", "youssefmohmmed/dogs-skin-diseases-image-dataset"),
        "datasetUrl": ckpt.get("dataset_url", "https://www.kaggle.com/datasets/youssefmohmmed/dogs-skin-diseases-image-dataset"),
        "inputSize": int(ckpt.get("input_size", 224)),
        "normalization": norm,
        "temperature": round(temperature, 6),
        "classes": classes,
        "diseaseCatalog": ckpt["disease_catalog"],
        "onnxFileSizeMb": size_mb,
        "pytorchTestMetrics": eval_summary.get("test_metrics") or ckpt.get("metrics"),
        "edgeOnnxTestMetrics": edge_metrics,
        "classifierHead": {
            "eps": 1e-6,
            "lnWeight": ln_weight,
            "lnBias": ln_bias,
            "linearWeight": linear_weight,
            "linearBias": linear_bias,
        },
    }

    META_OUT_PATH.write_text(json.dumps(meta, separators=(",", ":")), encoding="utf-8")
    print(f"Exported ONNX: {ONNX_OUT_PATH} ({size_mb} MB)")
    print(f"Exported Meta: {META_OUT_PATH} ({round(META_OUT_PATH.stat().st_size / 1024, 1)} KB)")
    if edge_metrics:
        print(f"Edge INT8 ONNX Test Metrics: {json.dumps(edge_metrics)}")


if __name__ == "__main__":
    main()

