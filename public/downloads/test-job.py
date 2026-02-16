#!/usr/bin/env python3
"""
RunCor Test Job - Prime Number Calculator
This is a sample job that demonstrates the RunCor execution system.
It calculates prime numbers and generates a report.
"""

import time
import json
import sys
from datetime import datetime

def is_prime(n):
    """Check if a number is prime"""
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

def calculate_primes(count):
    """Calculate first N prime numbers"""
    primes = []
    num = 2
    while len(primes) < count:
        if is_prime(num):
            primes.append(num)
            # Print progress every 10 primes
            if len(primes) % 10 == 0:
                print(f"Found {len(primes)}/{count} primes... (last: {num})")
                sys.stdout.flush()
        num += 1
    return primes

def main():
    print("="*50)
    print("RUNCOR TEST JOB - Prime Calculator")
    print("="*50)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Configuration
    TARGET_COUNT = 100  # Number of primes to find
    
    print(f"Target: Find first {TARGET_COUNT} prime numbers")
    print("Working...")
    print()
    
    # Start timing
    start_time = time.time()
    
    # Calculate primes
    primes = calculate_primes(TARGET_COUNT)
    
    # End timing
    end_time = time.time()
    duration = end_time - start_time
    
    print()
    print("="*50)
    print("RESULTS")
    print("="*50)
    print(f"First 10 primes: {primes[:10]}")
    print(f"Last 10 primes: {primes[-10:]}")
    print(f"Largest prime found: {primes[-1]}")
    print(f"Total time: {duration:.2f} seconds")
    print(f"Primes per second: {TARGET_COUNT/duration:.2f}")
    print()
    
    # Save results to file
    results = {
        "job_type": "prime_calculator",
        "target_count": TARGET_COUNT,
        "primes_found": len(primes),
        "largest_prime": primes[-1],
        "duration_seconds": duration,
        "primes_per_second": TARGET_COUNT/duration,
        "first_10_primes": primes[:10],
        "last_10_primes": primes[-10:],
        "timestamp": datetime.now().isoformat()
    }
    
    with open("results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print("Results saved to: results.json")
    print()
    print("✓ Job completed successfully!")
    print("="*50)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
