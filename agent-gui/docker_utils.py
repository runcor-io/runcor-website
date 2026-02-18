"""
Docker utilities for RunCor Agent
Handles containerized job execution with security isolation
"""

import subprocess
import os
import sys
import tempfile
import shutil
from pathlib import Path
from typing import Optional, Dict, List, Tuple
import json

class DockerManager:
    """Manages Docker containers for secure job execution"""
    
    def __init__(self, logger=None):
        self.logger = logger
        self.available = False
        self.version = None
        self._check_docker()
    
    def _log(self, message: str, level: str = "INFO"):
        """Log message if logger available"""
        if self.logger:
            self.logger(message, level)
    
    def _check_docker(self) -> bool:
        """Check if Docker is installed and running"""
        try:
            result = subprocess.run(
                ["docker", "--version"],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                self.available = True
                self.version = result.stdout.strip()
                self._log(f"Docker detected: {self.version}")
                
                # Check if Docker daemon is running
                info_result = subprocess.run(
                    ["docker", "info", "--format", "{{.ServerVersion}}"],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                if info_result.returncode == 0:
                    self._log(f"Docker daemon running: {info_result.stdout.strip()}")
                    return True
                else:
                    self._log("Docker daemon not running", "WARN")
                    self.available = False
                    return False
            else:
                self.available = False
                return False
        except FileNotFoundError:
            self._log("Docker not installed", "WARN")
            self.available = False
            return False
        except Exception as e:
            self._log(f"Docker check failed: {e}", "ERROR")
            self.available = False
            return False
    
    def install_docker_windows(self, use_browser_fallback: bool = True) -> bool:
        """
        Install Docker Desktop on Windows
        Returns True if installation successful
        """
        self._log("Starting Docker Desktop installation...")
        
        installer_url = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
        installer_path = os.path.join(tempfile.gettempdir(), "DockerDesktopInstaller.exe")
        
        try:
            # Check if installer already exists
            if os.path.exists(installer_path):
                file_size_mb = os.path.getsize(installer_path) / (1024 * 1024)
                self._log(f"Found existing installer ({file_size_mb:.1f} MB), using it...")
            else:
                self._log("Downloading Docker Desktop (approx 500MB)...")
                self._log("This may take 10-20 minutes depending on your connection.")
                
                # Download using PowerShell with extended timeout (30 minutes)
                download_cmd = [
                    "powershell",
                    "-Command",
                    f"Invoke-WebRequest -Uri '{installer_url}' -OutFile '{installer_path}' -UseBasicParsing"
                ]
                
                try:
                    result = subprocess.run(
                        download_cmd,
                        capture_output=True,
                        text=True,
                        timeout=1800  # 30 minutes
                    )
                    
                    if result.returncode != 0:
                        self._log(f"Download failed: {result.stderr}", "ERROR")
                        if use_browser_fallback:
                            return self._open_docker_download_page()
                        return False
                    
                    self._log("Download complete!")
                except subprocess.TimeoutExpired:
                    self._log("Download timed out (30 min). Opening browser for manual download...", "WARN")
                    if use_browser_fallback:
                        return self._open_docker_download_page()
                    return False
            
            self._log("Installing Docker Desktop...")
            self._log("Administrator privileges required.")
            
            # Run installer silently
            install_cmd = [
                installer_path,
                "install",
                "--quiet",
                "--accept-license"
            ]
            
            result = subprocess.run(
                install_cmd,
                capture_output=True,
                text=True,
                timeout=600  # 10 minutes for installation
            )
            
            if result.returncode == 0:
                self._log("Docker Desktop installed successfully!")
                self._log("Please restart your computer, then start Docker Desktop.")
                # Clean up installer
                try:
                    os.remove(installer_path)
                except:
                    pass
                return True
            else:
                self._log(f"Installation failed: {result.stderr}", "ERROR")
                return False
                
        except Exception as e:
            self._log(f"Installation error: {e}", "ERROR")
            if use_browser_fallback:
                return self._open_docker_download_page()
            return False
    
    def _open_docker_download_page(self) -> bool:
        """Open Docker download page in browser as fallback"""
        self._log("Opening Docker download page in browser...")
        try:
            import webbrowser
            webbrowser.open("https://www.docker.com/products/docker-desktop")
            self._log("Browser opened. Please download and install manually.")
            self._log("After installation, restart RunCor Agent.")
            return True
        except Exception as e:
            self._log(f"Could not open browser: {e}", "ERROR")
            self._log("Please manually visit: https://www.docker.com/products/docker-desktop")
            return False
    
    def pull_image(self, image: str = "python:3.11-slim") -> bool:
        """Pull Docker image if not present"""
        if not self.available:
            return False
        
        try:
            # Check if image exists
            check_result = subprocess.run(
                ["docker", "images", "-q", image],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if check_result.stdout.strip():
                self._log(f"Image {image} already present")
                return True
            
            self._log(f"Pulling Docker image: {image}...")
            result = subprocess.run(
                ["docker", "pull", image],
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode == 0:
                self._log(f"Image {image} pulled successfully")
                return True
            else:
                self._log(f"Failed to pull image: {result.stderr}", "ERROR")
                return False
                
        except Exception as e:
            self._log(f"Error pulling image: {e}", "ERROR")
            return False
    
    def run_container(
        self,
        job_id: str,
        script_content: str,
        job_type: str = "python",
        work_dir: str = None,
        cpu_limit: str = "1.0",
        memory_limit: str = "4g",
        timeout: int = 300
    ) -> Tuple[bool, str, str]:
        """
        Run a job inside a Docker container
        
        Args:
            job_id: Unique job identifier
            script_content: The script to execute
            job_type: 'python' or 'powershell'
            work_dir: Working directory for file I/O
            cpu_limit: CPU cores limit (e.g., "1.0", "0.5")
            memory_limit: Memory limit (e.g., "4g", "2g")
            timeout: Maximum execution time in seconds
            
        Returns:
            (success: bool, stdout: str, stderr: str)
        """
        if not self.available:
            return False, "", "Docker not available"
        
        container_name = f"runcor-job-{job_id[:12]}"
        temp_script_dir = None
        
        try:
            # Create temp directory for script
            temp_script_dir = tempfile.mkdtemp(prefix=f"runcor_script_{job_id}_")
            
            # Write script to temp directory
            if job_type == "python":
                script_file = os.path.join(temp_script_dir, "job.py")
                with open(script_file, 'w') as f:
                    f.write(script_content)
                entry_cmd = ["python", "/app/job.py"]
                image = "python:3.11-slim"
            elif job_type == "powershell":
                script_file = os.path.join(temp_script_dir, "job.ps1")
                with open(script_file, 'w') as f:
                    f.write(script_content)
                entry_cmd = ["pwsh", "-File", "/app/job.ps1"]
                image = "mcr.microsoft.com/powershell:latest"
            else:
                return False, "", f"Unsupported job type: {job_type}"
            
            # Pull image if needed
            if not self.pull_image(image):
                return False, "", f"Failed to pull image: {image}"
            
            # Prepare volume mounts
            volumes = [f"{temp_script_dir}:/app:ro"]
            
            # Mount work directory if provided (at /workspace for compatibility)
            if work_dir and os.path.exists(work_dir):
                volumes.append(f"{work_dir}:/workspace:rw")
            
            # Build docker run command with security options
            cmd = [
                "docker", "run",
                "--rm",  # Remove container after exit
                "--name", container_name,
                "--network", "none",  # No network access
                "--cpus", cpu_limit,  # CPU limit
                "--memory", memory_limit,  # Memory limit
                "--memory-swap", memory_limit,  # No swap
                "--pids-limit", "100",  # Limit processes
                "--security-opt", "no-new-privileges:true",  # No privilege escalation
                "--cap-drop", "ALL",  # Drop all capabilities
                "-v", volumes[0],  # Script volume
            ]
            
            # Add work directory volume if exists
            if len(volumes) > 1:
                cmd.extend(["-v", volumes[1]])
            
            # Add working directory
            cmd.extend(["-w", "/workspace" if work_dir else "/app"])
            
            # Add image and command
            cmd.append(image)
            cmd.extend(entry_cmd)
            
            self._log(f"Starting container: {container_name}")
            self._log(f"Limits: CPU={cpu_limit}, RAM={memory_limit}, Network=disabled")
            if work_dir:
                self._log(f"Work dir mounted: {work_dir} -> /workspace")
            
            # Run container with timeout
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            success = result.returncode == 0
            stdout = result.stdout
            stderr = result.stderr
            
            if success:
                self._log(f"Container {container_name} completed successfully")
            else:
                self._log(f"Container {container_name} failed with code {result.returncode}", "WARN")
            
            return success, stdout, stderr
            
        except subprocess.TimeoutExpired:
            self._log(f"Container {container_name} timed out after {timeout}s", "ERROR")
            # Force kill container
            self._kill_container(container_name)
            return False, "", f"Job timed out after {timeout} seconds"
            
        except Exception as e:
            self._log(f"Container execution error: {e}", "ERROR")
            return False, "", str(e)
            
        finally:
            # Cleanup temp script directory
            if temp_script_dir and os.path.exists(temp_script_dir):
                try:
                    shutil.rmtree(temp_script_dir)
                except:
                    pass
            
            # Ensure container is removed
            self._kill_container(container_name)
    
    def _kill_container(self, container_name: str):
        """Force kill and remove a container"""
        try:
            subprocess.run(
                ["docker", "kill", container_name],
                capture_output=True,
                timeout=10
            )
            subprocess.run(
                ["docker", "rm", "-f", container_name],
                capture_output=True,
                timeout=10
            )
        except:
            pass
    
    def get_container_stats(self, container_name: str) -> Optional[Dict]:
        """Get resource usage stats for a running container"""
        if not self.available:
            return None
        
        try:
            result = subprocess.run(
                [
                    "docker", "stats", container_name,
                    "--no-stream",
                    "--format",
                    "{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}|{{.PIDs}}"
                ],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0 and result.stdout.strip():
                parts = result.stdout.strip().split("|")
                return {
                    "cpu_percent": parts[0] if len(parts) > 0 else "N/A",
                    "memory_usage": parts[1] if len(parts) > 1 else "N/A",
                    "memory_percent": parts[2] if len(parts) > 2 else "N/A",
                    "pids": parts[3] if len(parts) > 3 else "N/A"
                }
            return None
            
        except Exception as e:
            self._log(f"Error getting container stats: {e}", "ERROR")
            return None
    
    def cleanup_old_containers(self, prefix: str = "runcor-job-") -> int:
        """Remove old/stopped containers with given prefix"""
        if not self.available:
            return 0
        
        try:
            # List containers with prefix
            result = subprocess.run(
                ["docker", "ps", "-a", "--filter", f"name={prefix}", "--format", "{{.Names}}"],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                return 0
            
            containers = [c.strip() for c in result.stdout.strip().split("\n") if c.strip()]
            
            removed = 0
            for container in containers:
                rm_result = subprocess.run(
                    ["docker", "rm", "-f", container],
                    capture_output=True,
                    timeout=10
                )
                if rm_result.returncode == 0:
                    removed += 1
            
            if removed > 0:
                self._log(f"Cleaned up {removed} old containers")
            
            return removed
            
        except Exception as e:
            self._log(f"Cleanup error: {e}", "ERROR")
            return 0
    
    def get_system_info(self) -> Dict:
        """Get Docker system information"""
        if not self.available:
            return {"available": False}
        
        try:
            # Get Docker version
            version_result = subprocess.run(
                ["docker", "version", "--format", "{{.Server.Version}}"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            # Get system info
            info_result = subprocess.run(
                ["docker", "system", "df", "--format", "{{.Type}}: {{.Size}}"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            return {
                "available": True,
                "version": version_result.stdout.strip() if version_result.returncode == 0 else "Unknown",
                "storage": info_result.stdout.strip() if info_result.returncode == 0 else "Unknown"
            }
            
        except Exception as e:
            return {"available": True, "error": str(e)}


if __name__ == "__main__":
    # Test Docker manager
    print("Testing Docker Manager...")
    
    docker = DockerManager(logger=lambda msg, lvl: print(f"[{lvl}] {msg}"))
    
    if docker.available:
        print(f"[OK] Docker available: {docker.version}")
        
        # Test simple Python job
        test_script = '''
import sys
print("Hello from Docker container!")
print(f"Python version: {sys.version}")

# Try to write to work directory
with open("/work/output.txt", "w") as f:
    f.write("Test output file created successfully!")

print("Output file created.")
'''
        success, stdout, stderr = docker.run_container(
            job_id="test-123",
            script_content=test_script,
            job_type="python",
            work_dir=tempfile.mkdtemp(),
            cpu_limit="0.5",
            memory_limit="512m",
            timeout=60
        )
        
        print(f"\nJob result: {'SUCCESS' if success else 'FAILED'}")
        print(f"STDOUT:\n{stdout}")
        print(f"STDERR:\n{stderr}")
    else:
        print("[ERROR] Docker not available")
        print("Would you like to install Docker Desktop? (Windows)")
