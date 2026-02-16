# RunCor Example Jobs

These are example Python scripts you can use to test the RunCor job execution system.

## 1. Prime Number Calculator (`test-job.py`)

A simple CPU-intensive job that calculates prime numbers.

**What it does:**
- Finds the first 100 prime numbers
- Prints progress every 10 primes
- Saves results to `results.json`
- Reports execution time and performance

**Use for testing:**
- CPU compute jobs
- Basic Python execution
- Output file generation

## 2. ML Training Simulation (`test-job-ml.py`)

Simulates a machine learning training job.

**What it does:**
- Simulates training for 10 epochs
- Prints epoch-by-epoch progress
- Generates training metrics
- Saves model checkpoint

**Use for testing:**
- Long-running jobs
- Progress reporting
- Multiple output files

## How to Use

### As a Contractor:

1. Go to **Create Project**
2. Select **Python Script** job type
3. Copy/paste the example code
4. Set reward amount
5. Post the job

### As a Device Owner:

1. Download the agent
2. Login and register your device
3. Accept the job from Marketplace
4. Watch it execute in the Job Monitor

## Expected Output

### Prime Calculator Output:
```
==================================================
RUNCOR TEST JOB - Prime Calculator
==================================================
Started at: 2026-02-16 12:00:00

Target: Find first 100 prime numbers
Working...

Found 10/100 primes... (last: 29)
Found 20/100 primes... (last: 71)
...

==================================================
RESULTS
==================================================
First 10 primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
Largest prime found: 541
Total time: 0.05 seconds
Primes per second: 2000.00

Results saved to: results.json

✓ Job completed successfully!
```

## Creating Your Own Jobs

Your Python scripts should:

1. **Print progress** - Use `print()` so logs show in Job Monitor
2. **Save results** - Write to files that get returned
3. **Handle errors** - Use try/except for robustness
4. **Exit cleanly** - Return 0 for success, non-zero for failure

Example template:

```python
#!/usr/bin/env python3
import sys
import json
from datetime import datetime

def main():
    print("Starting job...")
    
    try:
        # Your code here
        result = do_work()
        
        # Save results
        with open("results.json", "w") as f:
            json.dump(result, f)
        
        print("✓ Job completed successfully!")
        return 0
        
    except Exception as e:
        print(f"Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
```

## Job Requirements

- Must be Python 3.6+
- Can use standard library only (no pip install)
- Should complete in reasonable time (< 1 hour recommended)
- Output files should be < 100MB
