#!/usr/bin/env python3
"""
Simple Image Processor - No external dependencies
Resizes images and creates thumbnails using PIL (included in python:3.11-slim)
"""

import os
import sys
from pathlib import Path
from PIL import Image

print("=" * 60)
print("RunCor Simple Image Processor")
print("Processing images without network access")
print("=" * 60)

# Paths
INPUT_DIR = Path("/workspace/input")
OUTPUT_DIR = Path("/workspace/output")
OUTPUT_DIR.mkdir(exist_ok=True)

# Find all images recursively (including subdirectories)
image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp', '.gif'}
image_files = [f for f in INPUT_DIR.rglob('*') 
               if f.is_file() and f.suffix.lower() in image_extensions]

print(f"\nFound {len(image_files)} images in {INPUT_DIR} (including subdirectories)")
print(f"Input directory contents: {list(INPUT_DIR.iterdir())}")

if not image_files:
    print("ERROR: No images found! Please provide input images.")
    sys.exit(1)

# Process each image
results = []
print(f"\nProcessing {len(image_files)} images...\n")

for idx, img_path in enumerate(sorted(image_files), 1):
    print(f"[{idx}/{len(image_files)}] Processing: {img_path.name}")
    
    try:
        # Open image
        with Image.open(img_path) as img:
            # Get original info
            orig_width, orig_height = img.size
            orig_format = img.format or "Unknown"
            
            print(f"   Original: {orig_width}x{orig_height} ({orig_format})")
            
            # Create thumbnail (256x256 max)
            thumb = img.copy()
            thumb.thumbnail((256, 256))
            thumb_path = OUTPUT_DIR / f"thumb_{img_path.stem}.jpg"
            thumb.save(thumb_path, "JPEG", quality=85)
            
            # Create medium version (800x800 max)
            medium = img.copy()
            medium.thumbnail((800, 800))
            medium_path = OUTPUT_DIR / f"medium_{img_path.stem}.jpg"
            medium.save(medium_path, "JPEG", quality=90)
            
            # Get file sizes
            orig_size = img_path.stat().st_size / 1024  # KB
            thumb_size = thumb_path.stat().st_size / 1024
            medium_size = medium_path.stat().st_size / 1024
            
            result = {
                "filename": img_path.name,
                "original_size_kb": round(orig_size, 2),
                "original_dimensions": f"{orig_width}x{orig_height}",
                "thumbnail_size_kb": round(thumb_size, 2),
                "medium_size_kb": round(medium_size, 2),
                "status": "success"
            }
            
            print(f"   Created thumbnail: {thumb_size:.1f} KB")
            print(f"   Created medium: {medium_size:.1f} KB")
            
    except Exception as e:
        result = {
            "filename": img_path.name,
            "error": str(e),
            "status": "failed"
        }
        print(f"   ERROR: {e}")
    
    results.append(result)

# Save results
import json
output_file = OUTPUT_DIR / "processing_results.json"
with open(output_file, 'w') as f:
    json.dump({
        "job_type": "image_processing",
        "total_images": len(image_files),
        "successful": sum(1 for r in results if r['status'] == 'success'),
        "failed": sum(1 for r in results if r['status'] == 'failed'),
        "results": results
    }, f, indent=2)

print(f"\n{'='*60}")
print(f"DONE! Processed {len(image_files)} images")
print(f"Results saved to: {output_file}")
print(f"Output directory: {OUTPUT_DIR}")
print(f"{'='*60}")

# List output files
print("\nOutput files:")
for f in sorted(OUTPUT_DIR.iterdir()):
    size = f.stat().st_size / 1024
    print(f"  - {f.name} ({size:.1f} KB)")
