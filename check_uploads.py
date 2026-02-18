#!/usr/bin/env python3
import os
from pymongo import MongoClient

# Use the connection string from env or default
uri = os.environ.get('MONGODB_URI', 'mongodb+srv://runcor:runcor123@runcor.7mgpq.mongodb.net/runcor?retryWrites=true&w=majority')
client = MongoClient(uri)
db = client['runcor']

# List uploaded files
files = list(db['uploads.files'].find({}, {'filename': 1, 'uploadDate': 1, 'length': 1, 'metadata': 1}).sort('uploadDate', -1).limit(10))

print('=' * 70)
print('RECENT UPLOADS IN MongoDB GridFS')
print('=' * 70)

if not files:
    print("No files found in uploads bucket!")
else:
    for f in files:
        size_mb = f.get('length', 0) / (1024*1024)
        uploaded_by = f.get('metadata', {}).get('uploadedBy', 'unknown')
        print(f"\n📁 File ID: {f['_id']}")
        print(f"   Name: {f.get('filename', 'unknown')}")
        print(f"   Size: {size_mb:.2f} MB")
        print(f"   Uploaded by: {uploaded_by}")
        print(f"   Date: {f.get('uploadDate', 'unknown')}")
        print(f"   Download URL: https://www.runcor.io/api/upload/{f['_id']}")
        print('-' * 70)

# Count total
total = db['uploads.files'].count_documents({})
print(f"\nTotal files in GridFS: {total}")
