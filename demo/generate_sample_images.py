#!/usr/bin/env python3
"""
Generate sample images for RunCor demo
Uses PIL to create placeholder images with labels
"""

from PIL import Image, ImageDraw, ImageFont
import os
import random

# Sample dataset themes
dataset = [
    ("cat_001.jpg", "orange", "Cat"),
    ("cat_002.jpg", "gray", "Cat"),
    ("dog_001.jpg", "brown", "Dog"),
    ("dog_002.jpg", "white", "Dog"),
    ("car_001.jpg", "red", "Sports Car"),
    ("car_002.jpg", "blue", "Sedan"),
    ("nature_001.jpg", "green", "Mountain"),
    ("nature_002.jpg", "yellow", "Forest"),
    ("city_001.jpg", "purple", "Skyline"),
    ("food_001.jpg", "orange", "Gourmet Dish"),
]

def create_placeholder(filename, color_name, label, size=(400, 300)):
    """Create a colored placeholder image with text"""
    
    # Color mapping
    colors = {
        "orange": (255, 165, 0),
        "gray": (128, 128, 128),
        "brown": (165, 42, 42),
        "white": (240, 240, 240),
        "red": (220, 20, 60),
        "blue": (30, 144, 255),
        "green": (34, 139, 34),
        "yellow": (255, 215, 0),
        "purple": (128, 0, 128),
    }
    
    # Create image with gradient effect
    img = Image.new('RGB', size, colors.get(color_name, (100, 100, 100)))
    draw = ImageDraw.Draw(img)
    
    # Add some visual noise/pattern
    for _ in range(50):
        x = random.randint(0, size[0])
        y = random.randint(0, size[1])
        r = random.randint(2, 8)
        draw.ellipse([x-r, y-r, x+r, y+r], fill=(255, 255, 255, 30))
    
    # Add text label
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
    except:
        font = ImageFont.load_default()
    
    # Text with background
    bbox = draw.textbbox((0, 0), label, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size[0] - text_width) // 2
    y = (size[1] - text_height) // 2
    
    # Draw text shadow
    draw.text((x+2, y+2), label, font=font, fill=(0, 0, 0))
    draw.text((x, y), label, font=font, fill=(255, 255, 255))
    
    # Add filename at bottom
    try:
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except:
        small_font = ImageFont.load_default()
    
    draw.text((10, size[1] - 25), f"File: {filename}", font=small_font, fill=(255, 255, 255))
    
    return img

def main():
    """Generate demo dataset"""
    output_dir = "demo_images"
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating sample images for RunCor demo...")
    print()
    
    for filename, color, label in dataset:
        filepath = os.path.join(output_dir, filename)
        img = create_placeholder(filename, color, label)
        img.save(filepath, quality=85)
        print(f"  Created: {filename} ({color} - {label})")
    
    print()
    print(f"Generated {len(dataset)} sample images in '{output_dir}/'")
    print()
    print("Next steps:")
    print("  1. ZIP the images:  cd demo_images && zip ../demo_input.zip *.jpg")
    print("  2. Upload to RunCor as job input")
    print("  3. Run the captioning job!")

if __name__ == "__main__":
    main()
