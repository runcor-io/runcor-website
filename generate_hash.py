#!/usr/bin/env python3
"""
Generate expected hash for RunCor deterministic jobs
Run this script after creating your job output to get the hash
"""

import hashlib
import os
import sys

def hash_file(filepath):
    """Compute SHA256 hash of a single file"""
    sha256 = hashlib.sha256()
    try:
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                sha256.update(chunk)
        return f"sha256:{sha256.hexdigest()}"
    except:
        return None

def hash_directory(directory):
    """Compute combined hash of all files in directory"""
    hashes = []
    try:
        for root, dirs, files in os.walk(directory):
            # Skip __pycache__ and hidden files
            files = [f for f in files if not f.startswith('.') and f != '__pycache__']
            for filename in sorted(files):
                filepath = os.path.join(root, filename)
                file_hash = hash_file(filepath)
                if file_hash:
                    hashes.append(file_hash)
                    print(f"  {filename}: {file_hash[:60]}...")
        
        if not hashes:
            print("No files found!")
            return None
        
        # Combine hashes
        combined = hashlib.sha256()
        for h in sorted(hashes):
            combined.update(h.encode())
        
        final_hash = f"sha256:{combined.hexdigest()}"
        print(f"\n✅ FINAL HASH: {final_hash}")
        return final_hash
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("RunCor Job Hash Generator")
    print("=" * 60)
    print("\nThis script generates the expected output hash for your job.")
    print("Run your job locally first, then run this script on the output folder.\n")
    
    # Create a test directory with sample output
    if len(sys.argv) < 2:
        print("Usage: python generate_hash.py <output_directory>")
        print("\nExample:")
        print("  python generate_hash.py ./my_job_output")
        print("\nOr create a test directory automatically? (y/n): ", end="")
        
        import tempfile
        test_dir = tempfile.mkdtemp(prefix="runcor_test_")
        
        # Create sample output files
        with open(os.path.join(test_dir, "output.txt"), "w") as f:
            f.write("Job completed successfully!\n")
        with open(os.path.join(test_dir, "results.json"), "w") as f:
            f.write('{"status": "success", "value": 42}\n')
        
        print(f"\nCreated test directory: {test_dir}")
        print("Files in test directory:")
        for f in os.listdir(test_dir):
            print(f"  - {f}")
        
        print(f"\nGenerating hash for test directory...\n")
        hash_directory(test_dir)
        
        # Cleanup
        import shutil
        shutil.rmtree(test_dir)
        
    else:
        directory = sys.argv[1]
        if not os.path.isdir(directory):
            print(f"Error: {directory} is not a valid directory")
            sys.exit(1)
        
        print(f"Scanning directory: {directory}\n")
        hash_directory(directory)
