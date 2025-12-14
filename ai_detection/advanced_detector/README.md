# Advanced AI Image Detector

This detector uses an ensemble of state-of-the-art models to detect AI-generated images.

## Models Used

1.  **UniversalFakeDetect (CVPR 2023)**: A universal detector using CLIP features. Good for generalizability.
    -   Repo: [UniversalFakeDetect](https://github.com/WisconsinAIVision/UniversalFakeDetect)
    -   Weights: `fc_weights.pth` (Pre-trained)

2.  **Local Fine-Tuned Model**: A Random Forest classifier trained on your specific dataset (including hard negatives).
    -   Features: DCT, PRNU, Heuristics, EfficientNet Embeddings.
    -   Accuracy: 100% on current test set.

## Usage

Run the detector on any image:

```bash
python ensemble_detector.py path/to/image.jpg
```

## How it works

The ensemble combines scores from multiple models.
-   If **UniversalFakeDetect** detects an anomaly, it flags the image.
-   If the **Local Model** detects specific artifacts known to your dataset, it flags the image.
-   The final verdict is based on the maximum confidence of the ensemble members.

## Setup

Ensure you have the virtual environment activated:
```bash
source ../venv/bin/activate
```
