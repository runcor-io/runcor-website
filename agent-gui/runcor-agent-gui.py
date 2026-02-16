#!/usr/bin/env python3
"""
RunCor Agent - GUI Version
A desktop application for connecting devices to the RunCor network.
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import json
import urllib.request
import urllib.error
import platform
import subprocess
import sys
import os
import time
import threading
import tempfile
import shutil
from pathlib import Path
from datetime import datetime

# Configuration
API_URL = "http://localhost:3000"
DEVICE_ID = None
USERNAME = None
AUTH_CREDENTIALS = None  # (username, password)
CAPABILITIES = []
POLL_INTERVAL = 10
CURRENT_JOB = None
STOP_EVENT = threading.Event()
GUI_OPEN = True  # Track if GUI is open

# Optional: WebSocket support
try:
    import socketio
    SOCKETIO_AVAILABLE = True
except ImportError:
    SOCKETIO_AVAILABLE = False

SIO = None

class RunCorAgentGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("RunCor Agent")
        self.root.geometry("900x700")
        self.root.minsize(800, 600)
        
        # Set window close handler
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
        # Style
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.configure_styles()
        
        # State
        self.logged_in = False
        self.device_registered = False
        self.hardware_info = None
        self.worker_thread = None
        self.heartbeat_thread = None
        
        # Create widgets
        self.create_widgets()
        
        # Center window
        self.center_window()
        
    def configure_styles(self):
        """Configure custom styles"""
        self.style.configure('Title.TLabel', font=('Helvetica', 20, 'bold'))
        self.style.configure('Header.TLabel', font=('Helvetica', 12, 'bold'))
        self.style.configure('Status.TLabel', font=('Helvetica', 10))
        self.style.configure('Accent.TButton', font=('Helvetica', 10, 'bold'))
        
    def center_window(self):
        """Center the window on screen"""
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
        
    def create_widgets(self):
        """Create the GUI widgets"""
        # Main container with padding
        self.main_frame = ttk.Frame(self.root, padding="20")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        self.main_frame.columnconfigure(0, weight=1)
        self.main_frame.rowconfigure(2, weight=1)
        
        # === Header ===
        self.create_header()
        
        # === Login Section (shown initially) ===
        self.create_login_section()
        
        # === Dashboard Section (shown after login) ===
        self.create_dashboard_section()
        
        # === Log Section ===
        self.create_log_section()
        
        # Show login initially, hide dashboard
        self.show_login()
        
    def create_header(self):
        """Create header with logo"""
        header = ttk.Frame(self.main_frame)
        header.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 20))
        
        # Title
        title = ttk.Label(header, text="⚡ RUNCOR AGENT", style='Title.TLabel')
        title.pack(side=tk.LEFT)
        
        # Status indicator
        self.status_var = tk.StringVar(value="Not Connected")
        self.status_label = ttk.Label(header, textvariable=self.status_var, 
                                      foreground='gray', font=('Helvetica', 10))
        self.status_label.pack(side=tk.RIGHT)
        
    def create_login_section(self):
        """Create login form"""
        self.login_frame = ttk.LabelFrame(self.main_frame, text="Device Registration", padding="20")
        
        # Username
        ttk.Label(self.login_frame, text="Username:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.username_entry = ttk.Entry(self.login_frame, width=40)
        self.username_entry.grid(row=0, column=1, sticky=(tk.W, tk.E), pady=5, padx=5)
        
        # Password
        ttk.Label(self.login_frame, text="Password:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.password_entry = ttk.Entry(self.login_frame, width=40, show="*")
        self.password_entry.grid(row=1, column=1, sticky=(tk.W, tk.E), pady=5, padx=5)
        
        # API URL
        ttk.Label(self.login_frame, text="API URL:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.api_url_entry = ttk.Entry(self.login_frame, width=40)
        self.api_url_entry.insert(0, API_URL)
        self.api_url_entry.grid(row=2, column=1, sticky=(tk.W, tk.E), pady=5, padx=5)
        
        # Register button
        self.login_btn = ttk.Button(self.login_frame, text="Connect Device", 
                                    command=self.on_login, style='Accent.TButton')
        self.login_btn.grid(row=3, column=0, columnspan=2, pady=20)
        
        # Hardware detection preview
        self.hw_preview = ttk.Label(self.login_frame, text="Click Connect to detect hardware...",
                                    foreground='gray', wraplength=500)
        self.hw_preview.grid(row=4, column=0, columnspan=2, pady=10)
        
    def create_dashboard_section(self):
        """Create dashboard (shown after login)"""
        self.dashboard_frame = ttk.Frame(self.main_frame)
        
        # Left panel - Device Info
        left_panel = ttk.LabelFrame(self.dashboard_frame, text="Device Information", padding="10")
        left_panel.grid(row=0, column=0, sticky=(tk.N, tk.S, tk.W, tk.E), padx=(0, 10))
        
        self.device_info_text = tk.Text(left_panel, height=10, width=35, 
                                        wrap=tk.WORD, font=('Consolas', 9),
                                        bg='#1a1a1a', fg='#00ff00',
                                        insertbackground='white')
        self.device_info_text.pack(fill=tk.BOTH, expand=True)
        self.device_info_text.config(state=tk.DISABLED)
        
        # Right panel - Job Status
        right_panel = ttk.LabelFrame(self.dashboard_frame, text="Job Status", padding="10")
        right_panel.grid(row=0, column=1, sticky=(tk.N, tk.S, tk.W, tk.E))
        self.dashboard_frame.columnconfigure(1, weight=1)
        
        self.job_status_var = tk.StringVar(value="Waiting for jobs...")
        ttk.Label(right_panel, textvariable=self.job_status_var, 
                 font=('Helvetica', 12)).pack(pady=10)
        
        # Job progress
        self.progress = ttk.Progressbar(right_panel, mode='indeterminate', length=300)
        self.progress.pack(pady=10)
        
        # Current job details
        self.job_details = scrolledtext.ScrolledText(right_panel, height=8, width=50,
                                                      font=('Consolas', 9),
                                                      bg='#1a1a1a', fg='#cccccc')
        self.job_details.pack(fill=tk.BOTH, expand=True, pady=10)
        self.job_details.insert(tk.END, "No active job\n")
        
        # Control buttons
        btn_frame = ttk.Frame(right_panel)
        btn_frame.pack(fill=tk.X, pady=10)
        
        self.pause_btn = ttk.Button(btn_frame, text="Pause", command=self.toggle_pause)
        self.pause_btn.pack(side=tk.LEFT, padx=5)
        
        self.estop_btn = ttk.Button(btn_frame, text="E-STOP", command=self.trigger_estop)
        self.estop_btn.pack(side=tk.LEFT, padx=5)
        
        ttk.Button(btn_frame, text="Disconnect", 
                  command=self.disconnect).pack(side=tk.RIGHT, padx=5)
        
        # Stats
        stats_frame = ttk.Frame(right_panel)
        stats_frame.pack(fill=tk.X, pady=10)
        
        self.jobs_completed_var = tk.StringVar(value="Jobs: 0")
        self.earnings_var = tk.StringVar(value="Earnings: $0.00")
        
        ttk.Label(stats_frame, textvariable=self.jobs_completed_var).pack(side=tk.LEFT, padx=10)
        ttk.Label(stats_frame, textvariable=self.earnings_var).pack(side=tk.LEFT, padx=10)
        
    def create_log_section(self):
        """Create log output section"""
        log_frame = ttk.LabelFrame(self.main_frame, text="Agent Log", padding="5")
        log_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(10, 0))
        
        self.log_text = scrolledtext.ScrolledText(log_frame, height=8, 
                                                   font=('Consolas', 9),
                                                   bg='#0a0a0a', fg='#00ff00',
                                                   wrap=tk.WORD)
        self.log_text.pack(fill=tk.BOTH, expand=True)
        self.log_text.config(state=tk.DISABLED)
        
        # Log scrollbar auto-scroll
        self.log_text.bind('<Configure>', lambda e: self.log_text.see(tk.END))
        
    def show_login(self):
        """Show login, hide dashboard"""
        self.login_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E))
        self.dashboard_frame.grid_remove()
        
    def show_dashboard(self):
        """Show dashboard, hide login"""
        self.login_frame.grid_remove()
        self.dashboard_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S))
        self.dashboard_frame.columnconfigure(0, weight=1)
        self.dashboard_frame.columnconfigure(1, weight=2)
        self.dashboard_frame.rowconfigure(0, weight=1)
        
    def log(self, message, tag="INFO"):
        """Add message to log"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, f"[{timestamp}] {tag}: {message}\n")
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)
        
    def update_device_info(self, info):
        """Update device info display"""
        self.device_info_text.config(state=tk.NORMAL)
        self.device_info_text.delete(1.0, tk.END)
        
        text = f"""Device ID: {info.get('device_id', 'N/A')}
CPU: {info.get('cpu', 'N/A')}
Cores: {info.get('cpu_cores', 'N/A')}
RAM: {info.get('ram', 'N/A')} GB
"""
        if info.get('gpu'):
            text += f"GPU: {info.get('gpu')}\n"
            if info.get('gpu_vram'):
                text += f"VRAM: {info.get('gpu_vram')} GB\n"
        
        text += f"OS: {info.get('os', 'N/A')}\n"
        text += f"Capabilities: {', '.join(info.get('capabilities', []))}\n"
        
        self.device_info_text.insert(tk.END, text)
        self.device_info_text.config(state=tk.DISABLED)
        
    def on_login(self):
        """Handle login button click"""
        username = self.username_entry.get().strip().lower()
        password = self.password_entry.get().strip()
        api_url = self.api_url_entry.get().strip()
        
        if not username or not password:
            messagebox.showerror("Error", "Please enter username and password")
            return
            
        global API_URL, USERNAME, AUTH_CREDENTIALS
        API_URL = api_url
        USERNAME = username
        AUTH_CREDENTIALS = (username, password)
        
        self.log(f"Starting hardware detection for {username}...")
        self.login_btn.config(state=tk.DISABLED)
        self.hw_preview.config(text="Detecting hardware...")
        
        # Run detection in background
        threading.Thread(target=self.detect_and_register, args=(username,), daemon=True).start()
        
    def detect_and_register(self, username):
        """Detect hardware and register device"""
        try:
            # Detect hardware
            info = self.detect_hardware()
            self.hardware_info = info
            
            self.root.after(0, lambda: self.update_device_info(info))
            self.root.after(0, lambda: self.hw_preview.config(
                text=f"Detected: {info['cpu']}\n{info['ram']}GB RAM" + 
                     (f"\nGPU: {info['gpu']}" if info.get('gpu') else "")
            ))
            
            # Register device
            self.log("Registering device with RunCor...")
            success = self.register_device(info, username)
            
            if success:
                self.root.after(0, self.on_registration_success)
            else:
                self.root.after(0, lambda: messagebox.showerror(
                    "Registration Failed", 
                    "Could not register device. Check credentials and try again."
                ))
                self.root.after(0, lambda: self.login_btn.config(state=tk.NORMAL))
                
        except Exception as e:
            self.log(f"Error: {str(e)}", "ERROR")
            self.root.after(0, lambda: messagebox.showerror("Error", str(e)))
            self.root.after(0, lambda: self.login_btn.config(state=tk.NORMAL))
            
    def on_registration_success(self):
        """Called when registration is successful"""
        self.logged_in = True
        self.device_registered = True
        self.status_var.set("Connected - Active")
        self.status_label.config(foreground='green')
        self.show_dashboard()
        
        # Start worker threads
        self.start_workers()
        
    def detect_hardware(self):
        """Detect system hardware"""
        info = {}
        
        # CPU
        try:
            result = subprocess.run(['wmic', 'cpu', 'get', 'Name', '/format:csv'], 
                                  capture_output=True, text=True)
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if 'Intel' in line or 'AMD' in line:
                    parts = line.split(',')
                    if len(parts) >= 2:
                        info['cpu'] = parts[-1].strip()  # Last part is the name
                        break
            if 'cpu' not in info:
                info['cpu'] = platform.processor() or "Unknown CPU"
        except:
            info['cpu'] = platform.processor() or "Unknown CPU"
            
        # Cores
        try:
            result = subprocess.run(['wmic', 'cpu', 'get', 'NumberOfCores', '/format:csv'],
                                  capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                parts = line.strip().split(',')
                if len(parts) >= 2:
                    # Last part should be the number
                    try:
                        info['cpu_cores'] = int(parts[-1])
                        break
                    except:
                        continue
            if 'cpu_cores' not in info:
                info['cpu_cores'] = 4
        except:
            info['cpu_cores'] = 4
            
        # RAM
        try:
            result = subprocess.run(['wmic', 'computersystem', 'get', 'TotalPhysicalMemory', '/format:csv'],
                                  capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                parts = line.strip().split(',')
                if len(parts) >= 2:
                    try:
                        info['ram'] = round(int(parts[-1]) / (1024**3))
                        break
                    except:
                        continue
            if 'ram' not in info:
                info['ram'] = 16
        except:
            info['ram'] = 16
            
        # GPU
        info['gpu'] = None
        info['gpu_vram'] = 0
        try:
            result = subprocess.run(['wmic', 'path', 'win32_VideoController', 'get', 'Name,AdapterRAM', '/format:csv'],
                                  capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                if 'NVIDIA' in line or 'AMD' in line or 'Intel' in line:
                    parts = line.split(',')
                    if len(parts) >= 2:
                        info['gpu'] = parts[1].strip()
                        break
        except:
            pass
            
        # Device ID
        try:
            result = subprocess.run(['wmic', 'csproduct', 'get', 'UUID', '/format:csv'],
                                  capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                if '-' in line:
                    parts = line.split(',')
                    if len(parts) >= 2:
                        uuid = parts[1].strip().replace('-', '')
                        info['device_id'] = f"0x{uuid[:16]}"
                        break
        except:
            import random
            info['device_id'] = f"0x{random.randint(10000000, 99999999)}{random.randint(10000000, 99999999)}"
            
        info['architecture'] = 'amd64'
        info['capabilities'] = ['cpu_compute', 'windows']
        if info['gpu']:
            info['capabilities'].extend(['gpu_compute', 'cuda', 'rendering'])
        info['max_job_ram'] = f"{info['ram'] - 4}gb"
        
        global DEVICE_ID, CAPABILITIES
        DEVICE_ID = info['device_id']
        CAPABILITIES = info['capabilities']
        
        return info
        
    def api_request(self, method, endpoint, data=None):
        """Make API request"""
        url = f"{API_URL}{endpoint}"
        try:
            headers = {'Content-Type': 'application/json'}
            if data:
                data = json.dumps(data).encode('utf-8')
                
            req = urllib.request.Request(url, data=data, headers=headers, method=method)
            
            # Add basic auth if we have credentials
            if AUTH_CREDENTIALS:
                import base64
                creds = base64.b64encode(f"{AUTH_CREDENTIALS[0]}:{AUTH_CREDENTIALS[1]}".encode()).decode()
                req.add_header('Authorization', f'Basic {creds}')
                
            with urllib.request.urlopen(req, timeout=30) as response:
                return json.loads(response.read().decode('utf-8'))
        except Exception as e:
            self.log(f"API error: {e}", "ERROR")
            return None
            
    def register_device(self, info, username):
        """Register device with API"""
        gpu_info = None
        if info.get('gpu'):
            gpu_info = {
                "model": info['gpu'],
                "vramGB": info.get('gpu_vram', 0),
                "cuda": True,
                "openCL": True
            }
            
        payload = {
            "deviceId": info['device_id'],
            "username": username,
            "specs": {
                "architecture": info['architecture'],
                "cpu": info['cpu'],
                "cpuCores": info['cpu_cores'],
                "ramGB": info['ram'],
                "gpu": gpu_info,
                "os": "windows",
                "capabilities": info['capabilities'],
                "maxJobRAM": info['max_job_ram']
            },
            "status": {
                "cpuLoadPercent": 0,
                "ramUsedPercent": 0,
                "jobStatus": "idle",
                "uptimeSeconds": 0
            }
        }
        
        result = self.api_request("POST", "/api/devices", payload)
        return result and result.get('success')
        
    def start_workers(self):
        """Start background worker threads"""
        global STOP_EVENT, GUI_OPEN
        STOP_EVENT.clear()
        GUI_OPEN = True
        
        # Start job worker
        self.worker_thread = threading.Thread(target=self.job_worker, daemon=True)
        self.worker_thread.start()
        
        # Start heartbeat
        self.heartbeat_thread = threading.Thread(target=self.heartbeat_worker, daemon=True)
        self.heartbeat_thread.start()
        
        self.log("Workers started - Agent is active")
        
    def stop_workers(self):
        """Stop background workers"""
        global STOP_EVENT, GUI_OPEN
        STOP_EVENT.set()
        GUI_OPEN = False
        
        # Mark device as offline
        if DEVICE_ID:
            self.api_request("POST", "/api/devices", {
                "deviceId": DEVICE_ID,
                "status": {
                    "jobStatus": "offline"
                }
            })
            
        self.log("Workers stopped - Device marked offline")
        
    def job_worker(self):
        """Main job polling worker"""
        global CURRENT_JOB
        
        self.log("Job worker started")
        
        while not STOP_EVENT.is_set():
            try:
                if CURRENT_JOB is None:
                    # Poll for assigned jobs
                    result = self.api_request("GET", f"/api/jobs?device_id={DEVICE_ID}&status=claimed")
                    
                    if result and isinstance(result, list) and len(result) > 0:
                        job = result[0]
                        CURRENT_JOB = job
                        self.root.after(0, lambda j=job: self.on_job_assigned(j))
                        self.execute_job(job)
                        
                STOP_EVENT.wait(POLL_INTERVAL)
            except Exception as e:
                self.log(f"Worker error: {e}", "ERROR")
                STOP_EVENT.wait(POLL_INTERVAL)
                
    def on_job_assigned(self, job):
        """Called when a job is assigned"""
        self.job_status_var.set(f"Executing: {job['title']}")
        self.progress.start()
        self.job_details.delete(1.0, tk.END)
        self.job_details.insert(tk.END, f"Job: {job['title']}\n")
        self.job_details.insert(tk.END, f"Type: {job.get('type', 'unknown')}\n")
        self.job_details.insert(tk.END, f"Reward: ${job.get('reward', 0)}\n\n")
        
    def execute_job(self, job):
        """Execute a job"""
        global CURRENT_JOB
        
        job_id = job['_id']
        self.log(f"Starting job: {job['title']}")
        
        # Update status to running
        self.update_job_status(job_id, "running", logs=["Job started"])
        
        try:
            # Simulate job execution (replace with actual job execution)
            work_dir = tempfile.mkdtemp(prefix=f"runcor_{job_id}_")
            
            # Update UI
            self.root.after(0, lambda: self.job_details.insert(tk.END, "Executing...\n"))
            
            # Simulate work
            for i in range(10):
                if STOP_EVENT.is_set():
                    raise Exception("Job cancelled")
                time.sleep(1)
                self.root.after(0, lambda i=i: self.job_details.insert(tk.END, f"Step {i+1}/10 complete\n"))
                
            # Mark completed
            self.update_job_status(job_id, "completed", 
                                 logs=["Job completed successfully"],
                                 result={"status": "success"})
            
            self.log(f"Job completed: {job['title']}", "SUCCESS")
            self.root.after(0, self.on_job_completed)
            
        except Exception as e:
            self.update_job_status(job_id, "failed", error=str(e))
            self.log(f"Job failed: {e}", "ERROR")
            self.root.after(0, lambda: self.job_status_var.set("Job failed"))
            
        finally:
            try:
                shutil.rmtree(work_dir)
            except:
                pass
            CURRENT_JOB = None
            self.root.after(0, self.progress.stop)
            
    def on_job_completed(self):
        """Called when job completes"""
        self.job_status_var.set("Waiting for jobs...")
        self.job_details.insert(tk.END, "\n✓ Job completed successfully!")
        
        # Update stats
        current_jobs = int(self.jobs_completed_var.get().split(':')[1].strip())
        self.jobs_completed_var.set(f"Jobs: {current_jobs + 1}")
        
    def update_job_status(self, job_id, status, logs=None, result=None, error=None):
        """Update job status via API"""
        payload = {
            "jobId": job_id,
            "deviceId": DEVICE_ID,
            "status": status
        }
        if logs:
            payload["logs"] = logs
        if result:
            payload["result"] = result
        if error:
            payload["error"] = error
            
        return self.api_request("PATCH", "/api/jobs", payload)
        
    def heartbeat_worker(self):
        """Send periodic heartbeat to keep device online"""
        while not STOP_EVENT.is_set():
            try:
                if DEVICE_ID and GUI_OPEN:
                    # Get system stats
                    try:
                        import psutil
                        cpu = psutil.cpu_percent(interval=1)
                        ram = psutil.virtual_memory().percent
                    except:
                        cpu = 0
                        ram = 0
                        
                    self.api_request("POST", "/api/devices", {
                        "deviceId": DEVICE_ID,
                        "status": {
                            "cpuLoadPercent": cpu,
                            "ramUsedPercent": ram,
                            "jobStatus": "busy" if CURRENT_JOB else "idle",
                            "uptimeSeconds": 0
                        },
                        "currentJob": CURRENT_JOB['_id'] if CURRENT_JOB else None
                    })
                    
            except Exception as e:
                pass
                
            STOP_EVENT.wait(30)  # Update every 30 seconds
            
    def toggle_pause(self):
        """Toggle pause state"""
        # Implementation for pause/resume
        messagebox.showinfo("Info", "Pause/Resume functionality to be implemented")
        
    def trigger_estop(self):
        """Trigger emergency stop"""
        if messagebox.askyesno("E-STOP", "Stop all operations immediately?"):
            STOP_EVENT.set()
            self.log("E-STOP triggered", "WARNING")
            self.status_var.set("EMERGENCY STOP")
            self.status_label.config(foreground='red')
            
    def disconnect(self):
        """Disconnect device"""
        self.stop_workers()
        self.logged_in = False
        self.status_var.set("Disconnected")
        self.status_label.config(foreground='gray')
        self.show_login()
        
    def on_closing(self):
        """Handle window close"""
        if messagebox.askokcancel("Quit", "Close RunCor Agent?\n\nYour device will be marked offline."):
            self.stop_workers()
            self.root.destroy()
            
def main():
    root = tk.Tk()
    app = RunCorAgentGUI(root)
    root.mainloop()
    
if __name__ == "__main__":
    main()
