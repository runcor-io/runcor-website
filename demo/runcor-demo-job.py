#!/usr/bin/env python3
"""
RunCor Demo: AI Image Caption Generator
========================================
A real-world ML workload demonstrating:
- Secure Docker execution
- File I/O (input/output)
- Progress reporting
- Resource monitoring

For demo: Uses lightweight mock model (no GPU needed)
For production: Swap in real CLIP/BLIP model
"""

import json
import os
import sys
import time
import random
from pathlib import Path
from datetime import datetime

# Demo configuration
INPUT_DIR = "/workspace/input"
OUTPUT_DIR = "/workspace/output"
PROGRESS_FILE = "/workspace/output/progress.json"

def report_progress(current, total, stage, message=""):
    """Report progress to RunCor API (writes to file for demo)"""
    progress = {
        "timestamp": datetime.now().isoformat(),
        "percent": int((current / total) * 100),
        "stage": stage,
        "message": message,
        "processed": current,
        "total": total
    }
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f)
    print(f"📊 Progress: {progress['percent']}% - {stage}")
    sys.stdout.flush()

def load_mock_model():
    """Simulate loading an AI model (takes ~2 seconds)"""
    print("🔄 Loading AI model...")
    time.sleep(1)
    print("✅ Model loaded: CLIP-based caption generator v1.0")
    print("📦 Parameters: 150M")
    print("🎯 Device: CPU (Docker isolated)")
    return True

def analyze_image(image_path):
    """
    Mock AI analysis - simulates processing time
    In production: Replace with real inference
    """
    filename = Path(image_path).stem.lower()
    
    # Simulate processing time (varies by image complexity)
    processing_time = random.uniform(0.5, 1.5)
    time.sleep(processing_time)
    
    # Mock captions based on filename patterns
    captions = {
        "cat": ["A cat sitting on a windowsill", "A fluffy domestic cat", "A curious feline exploring"],
        "dog": ["A dog playing in the park", "A loyal companion outdoors", "A happy puppy running"],
        "car": ["A sleek sports car", "Luxury vehicle on the road", "Modern automotive design"],
        "nature": ["Mountain landscape at sunset", "Serene forest scene", "Breathtaking natural vista"],
        "city": ["Urban skyline at night", "Busy city street", "Modern architecture"],
        "food": ["Delicious gourmet meal", "Fresh ingredients arranged", "Appetizing dish presentation"],
    }
    
    # Match keyword or use generic
    caption = "An interesting photograph"
    for keyword, options in captions.items():
        if keyword in filename:
            caption = random.choice(options)
            break
    
    return {
        "caption": caption,
        "confidence": round(random.uniform(0.85, 0.98), 2),
        "processing_time": round(processing_time, 2),
        "model": "clip-caption-mock-v1"
    }

def main():
    """Main execution flow"""
    print("=" * 60)
    print("🚀 RunCor AI Image Caption Generator")
    print("=" * 60)
    print()
    
    # Stage 1: Setup
    report_progress(0, 100, "init", "Initializing environment...")
    print(f"📁 Input directory: {INPUT_DIR}")
    print(f"📁 Output directory: {OUTPUT_DIR}")
    
    # Check for input files
    if not os.path.exists(INPUT_DIR):
        print("❌ Error: Input directory not found")
        sys.exit(1)
    
    image_files = [f for f in os.listdir(INPUT_DIR) 
                   if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    
    if not image_files:
        print("❌ Error: No images found in input directory")
        sys.exit(1)
    
    print(f"📸 Found {len(image_files)} images to process")
    print()
    
    # Stage 2: Load model
    report_progress(5, 100, "model_loading", "Loading AI model...")
    load_mock_model()
    print()
    
    # Stage 3: Process images with progress
    results = []
    total = len(image_files)
    
    print(f"🖼️  Processing {total} images...")
    print("-" * 60)
    
    for idx, img_file in enumerate(sorted(image_files), 1):
        img_path = os.path.join(INPUT_DIR, img_file)
        
        # Update progress (5% to 95%)
        progress_pct = 5 + int((idx / total) * 90)
        report_progress(
            progress_pct, 
            100, 
            "processing", 
            f"Processing image {idx}/{total}: {img_file}"
        )
        
        # Process image
        analysis = analyze_image(img_file)
        results.append({
            "image_id": idx,
            "filename": img_file,
            "caption": analysis["caption"],
            "confidence": analysis["confidence"],
            "metadata": analysis
        })
        
        print(f"  ✓ [{idx}/{total}] {img_file}")
        print(f"    Caption: {analysis['caption']}")
        print(f"    Confidence: {analysis['confidence']*100:.0f}%")
        print()
    
    # Stage 4: Generate output
    report_progress(95, 100, "saving", "Saving results...")
    
    output_data = {
        "job_info": {
            "type": "image_captioning",
            "processed_at": datetime.now().isoformat(),
            "total_images": len(results),
            "avg_confidence": round(
                sum(r['confidence'] for r in results) / len(results), 2
            )
        },
        "results": results
    }
    
    output_file = os.path.join(OUTPUT_DIR, "captions.json")
    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=2)
    
    # Stage 5: Complete
    report_progress(100, 100, "complete", "Job finished successfully!")
    
    print("=" * 60)
    print("✅ Demo Complete!")
    print("=" * 60)
    print(f"📄 Output saved to: {output_file}")
    print(f"📊 Processed {len(results)} images")
    print(f"💰 Estimated value: ${len(results) * 0.50:.2f}")
    print()
    print("Sample output preview:")
    for r in results[:3]:
        print(f"  • {r['filename']}: \"{r['caption']}\"")
    if len(results) > 3:
        print(f"  ... and {len(results) - 3} more")

if __name__ == "__main__":
    main()
