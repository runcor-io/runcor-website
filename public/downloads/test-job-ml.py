#!/usr/bin/env python3
"""
RunCor Test Job - ML Training Simulation
Simulates a machine learning training job with progress reporting.
"""

import time
import json
import random
import sys
from datetime import datetime

def simulate_training(epochs=10):
    """Simulate ML training with progress updates"""
    
    print("="*50)
    print("RUNCOR TEST JOB - ML Training Simulation")
    print("="*50)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Simulate training metrics
    train_loss = 1.0
    val_accuracy = 0.5
    
    print(f"Configuration:")
    print(f"  Epochs: {epochs}")
    print(f"  Initial loss: {train_loss:.4f}")
    print(f"  Initial accuracy: {val_accuracy:.2%}")
    print()
    print("Starting training...")
    print()
    
    history = []
    
    for epoch in range(1, epochs + 1):
        # Simulate epoch time
        time.sleep(0.5)
        
        # Simulate improving metrics
        train_loss *= 0.85  # Loss decreases
        val_accuracy = min(0.99, val_accuracy + random.uniform(0.02, 0.05))  # Accuracy increases
        
        metrics = {
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "val_accuracy": round(val_accuracy, 4),
            "learning_rate": 0.001 * (0.9 ** epoch)
        }
        history.append(metrics)
        
        # Print progress
        print(f"Epoch {epoch:2d}/{epochs} - loss: {train_loss:.4f} - accuracy: {val_accuracy:.2%}")
        sys.stdout.flush()
    
    print()
    print("="*50)
    print("TRAINING COMPLETE")
    print("="*50)
    print(f"Final loss: {train_loss:.4f}")
    print(f"Final accuracy: {val_accuracy:.2%}")
    print(f"Improvement: {(val_accuracy - 0.5) / 0.5 * 100:.1f}%")
    print()
    
    # Save results
    results = {
        "job_type": "ml_training_simulation",
        "epochs": epochs,
        "final_loss": train_loss,
        "final_accuracy": val_accuracy,
        "training_history": history,
        "model_size_mb": random.uniform(50, 200),
        "timestamp": datetime.now().isoformat()
    }
    
    with open("training_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    # Save model checkpoint (simulated)
    with open("model_checkpoint.txt", "w") as f:
        f.write(f"Simulated Model Checkpoint\n")
        f.write(f"Created: {datetime.now()}\n")
        f.write(f"Epochs: {epochs}\n")
        f.write(f"Accuracy: {val_accuracy:.2%}\n")
    
    print("Results saved:")
    print("  - training_results.json")
    print("  - model_checkpoint.txt")
    print()
    print("✓ Job completed successfully!")
    print("="*50)
    
    return 0

if __name__ == "__main__":
    epochs = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    sys.exit(simulate_training(epochs))
