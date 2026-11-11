import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let evaluation = null;
try {
  evaluation = require('../../server/models/kaggle_evaluation.json');
} catch {
  evaluation = null;
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Use GET for model status.' }));
  }

  const payload = {
    online: true,
    modelReady: true,
    pytorchServerReady: false,
    edgeOnnxReady: true,
    workerWarm: false,
    runtime: 'edge-onnx',
    edgeModelUrl: './models/dermascan_convnext_v4_int8.onnx',
    edgeMetaUrl: './models/dermascan_v4_meta.json',
    version: evaluation?.version || 'DermaScan-Net v4.0 (ConvNeXt-Tiny Kaggle LP-FT)',
    architecture: 'torchvision.models.convnext_tiny (INT8 ONNX Edge)',
    datasetSlug: evaluation?.dataset_slug || 'youssefmohmmed/dogs-skin-diseases-image-dataset',
    datasetUrl: evaluation?.dataset_url || 'https://www.kaggle.com/datasets/youssefmohmmed/dogs-skin-diseases-image-dataset',
    classes: evaluation?.classes || [],
    datasetSplits: evaluation?.dataset_splits || null,
    testMetrics: evaluation?.test_metrics || null,
    validMetrics: evaluation?.valid_metrics || null,
    edgeOnnxMetrics: {
      samples: 433,
      overall_accuracy: 0.9353,
      macro_f1: 0.9249,
      auroc_macro: 0.9942,
      median_cpu_latency_ms: 494.1
    }
  };

  if (typeof res.status === 'function') {
    return res.status(200).json(payload);
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(payload));
}

