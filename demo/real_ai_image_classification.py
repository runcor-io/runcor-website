#!/usr/bin/env python3
"""
Real AI Image Classification Job
Uses MobileNetV2 (pre-trained on ImageNet) to classify images

Input: Images in /workspace/input/ (any format: jpg, png, etc.)
Output: classification_results.json in /workspace/output/
"""

import os
import sys
import json
from pathlib import Path

# Install required packages if not present
import subprocess
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "torch", "torchvision", "Pillow"])

import torch
from torchvision import models, transforms
from PIL import Image

print("=" * 60)
print("RunCor AI Image Classification")
print("Model: MobileNetV2 pre-trained on ImageNet")
print("=" * 60)

# Paths
INPUT_DIR = Path("/workspace/input")
OUTPUT_DIR = Path("/workspace/output")
OUTPUT_DIR.mkdir(exist_ok=True)

# Find all images
image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
image_files = [f for f in INPUT_DIR.iterdir() 
               if f.is_file() and f.suffix.lower() in image_extensions]

print(f"\nFound {len(image_files)} images in {INPUT_DIR}")

if not image_files:
    print("ERROR: No images found! Please provide input images.")
    sys.exit(1)

# Load pre-trained MobileNetV2
print("\nLoading MobileNetV2 model...")
model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V2)
model.eval()

# Image preprocessing
def preprocess_image(image_path):
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    image = Image.open(image_path).convert('RGB')
    return transform(image).unsqueeze(0)

# Get ImageNet class labels
def get_imagenet_labels():
    # Download labels if not present
    labels_path = OUTPUT_DIR / "imagenet_classes.txt"
    if not labels_path.exists():
        import urllib.request
        url = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
        urllib.request.urlretrieve(url, labels_path)
    
    with open(labels_path, 'r') as f:
        return [line.strip() for line in f.readlines()]

print("Loading ImageNet class labels...")
class_labels = get_imagenet_labels()

# Process each image
print(f"\nProcessing {len(image_files)} images...\n")
results = []

for idx, img_path in enumerate(sorted(image_files), 1):
    print(f"[{idx}/{len(image_files)}] Processing: {img_path.name}")
    
    try:
        # Load and preprocess
        input_tensor = preprocess_image(img_path)
        
        # Run inference
        with torch.no_grad():
            output = model(input_tensor)
        
        # Get top 3 predictions
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        top3_prob, top3_idx = torch.topk(probabilities, 3)
        
        predictions = []
        for prob, idx in zip(top3_prob, top3_idx):
            predictions.append({
                "label": class_labels[idx],
                "confidence": round(prob.item() * 100, 2)
            })
        
        result = {
            "filename": img_path.name,
            "predictions": predictions,
            "status": "success"
        }
        
        print(f"   Top prediction: {predictions[0]['label']} ({predictions[0]['confidence']}%)")
        
    except Exception as e:
        result = {
            "filename": img_path.name,
            "error": str(e),
            "status": "failed"
        }
        print(f"   ERROR: {e}")
    
    results.append(result)

# Save results
output_file = OUTPUT_DIR / "classification_results.json"
with open(output_file, 'w') as f:
    json.dump({
        "job_type": "ai_image_classification",
        "model": "mobilenet_v2",
        "total_images": len(image_files),
        "successful": sum(1 for r in results if r['status'] == 'success'),
        "failed": sum(1 for r in results if r['status'] == 'failed'),
        "results": results
    }, f, indent=2)

print(f"\n{'='*60}")
print(f"DONE! Processed {len(image_files)} images")
print(f"Results saved to: {output_file}")
print(f"{'='*60}")

# Also create a summary text file
summary_file = OUTPUT_DIR / "summary.txt"
with open(summary_file, 'w') as f:
    f.write("AI IMAGE CLASSIFICATION RESULTS\n")
    f.write("=" * 50 + "\n\n")
    for r in results:
        if r['status'] == 'success':
            f.write(f"{r['filename']}:\n")
            f.write(f"  -> {r['predictions'][0]['label']} ({r['predictions'][0]['confidence']}%)\n\n")

print(f"Summary saved to: {summary_file}")
