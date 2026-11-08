# Dog skin image classifier prototype

This folder contains a reproducible, **research-only** training script. The classifier is not connected to the customer photo review API and must not be used to diagnose animals or guide treatment.

## Dataset

The source is Hwang et al. (2022), [Classification of pet dog skin diseases using deep learning with images captured from multispectral imaging device](https://data.mendeley.com/datasets/5dbht54kw7/1), DOI [10.17632/5dbht54kw7.1](https://doi.org/10.17632/5dbht54kw7.1), licensed CC BY 4.0. The source paper reports 95 dogs, but the archive's `image_label.txt` labels only 62 case folders. The remaining unlabeled folders are excluded. The script uses one `pic0.jpg` image per labeled case and ignores the other nine multispectral images because customer uploads are ordinary RGB photos.

## Reproduce

Download the dataset archive from the Mendeley page above into `training-data/dog_skin_dataset.zip`. That directory, the Python environment, and model outputs are git-ignored; the image archive and trained weights are not uploaded to GitHub.

Install Python 3.10+ with PyTorch, TorchVision, NumPy, Pillow, and scikit-learn, then run:

```powershell
uv venv .venv-ml
uv pip install --python .venv-ml\Scripts\python.exe torch torchvision scikit-learn pillow numpy
.venv-ml\Scripts\python.exe research\train_dog_skin_prototype.py --inspect-only
.venv-ml\Scripts\python.exe research\train_dog_skin_prototype.py --folds 5
```

The script extracts frozen ImageNet ResNet18 features from the standard RGB images, trains a balanced logistic-regression classifier, evaluates with five stratified folds grouped by case folder, and saves the full-data classifier and out-of-fold metrics to `training-output/`.

## Current run

The available labels are 13 allergic-dermatosis, 12 bacterial-dermatosis, 11 fungal-infection, and 26 healthy cases. Five-fold case-grouped evaluation produced **30.6% accuracy**, **27.0% balanced accuracy**, and **27.2% macro F1**. Fungal-infection recall was **9.1%**. Although 25% is the balanced four-class chance level, the model also underperforms the simple majority-class baseline of **41.9% accuracy**. It is not useful as a customer-facing classifier.

This is internal cross-validation on a tiny, single-source dataset, not an independent clinical evaluation. The photo collection is tightly framed and was acquired in one study context. Performance on new phones, breeds, coat types, body sites, lighting, cats, or birds is unknown. More data and independent veterinary evaluation are required before any clinical claim. The current DermaScan analysis therefore remains limited to describing visible features.
