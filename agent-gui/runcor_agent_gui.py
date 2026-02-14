#!/usr/bin/env python3
"""
RunCor Agent GUI
A simple desktop application for registering HP Omen (or any Windows PC) with RunCor.
"""

import tkinter as tk
from tkinter import ttk, messagebox
import json
import urllib.request
import urllib.error
import threading

# Try to import WMI for hardware detection
try:
    import wmi
    WMI_AVAILABLE = True
except ImportError:
    WMI_AVAILABLE = False

import platform
import random


class RunCorAgentGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("RunCor Agent - Device Registration")
        self.root.geometry("600x700")
        self.root.configure(bg="#000000")
        self.root.resizable(False, False)
        
        # Hardware info storage
        self.hardware_info = {}
        self.device_id = None
        
        # Style configuration
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.style.configure("TFrame", background="#000000")
        self.style.configure("TLabel", background="#000000", foreground="#ffffff", font=("Segoe UI", 10))
        self.style.configure("Header.TLabel", background="#000000", foreground="#ffffff", font=("Segoe UI", 24, "bold"))
        self.style.configure("Subheader.TLabel", background="#000000", foreground="#888888", font=("Segoe UI", 10))
        self.style.configure("SpecLabel.TLabel", background="#0a0a0a", foreground="#cccccc", font=("Segoe UI", 11))
        self.style.configure("SpecValue.TLabel", background="#0a0a0a", foreground="#00d4ff", font=("Segoe UI", 11, "bold"))
        
        # Button styles
        self.style.configure("TButton", font=("Segoe UI", 11))
        self.style.configure("Accent.TButton", background="#00d4ff", foreground="#000000")
        
        self.create_widgets()
        
    def create_widgets(self):
        # Main container with padding
        main_frame = ttk.Frame(self.root, padding="30")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Logo / Header
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(header_frame, text="RUNCOR", style="Header.TLabel").pack()
        ttk.Label(header_frame, text="Agent Registration", style="Subheader.TLabel").pack()
        
        # Status indicator
        self.status_var = tk.StringVar(value="Ready to scan")
        self.status_label = ttk.Label(main_frame, textvariable=self.status_var, 
                                      font=("Segoe UI", 10), foreground="#00d4ff")
        self.status_label.pack(pady=(0, 20))
        
        # Hardware Specs Frame
        specs_frame = tk.Frame(main_frame, bg="#0a0a0a", bd=1, relief=tk.SOLID)
        specs_frame.pack(fill=tk.X, pady=(0, 20), ipady=10)
        
        # Specs header
        tk.Label(specs_frame, text="SYSTEM SPECIFICATIONS", bg="#0a0a0a", fg="#666666",
                font=("Segoe UI", 9, "bold")).pack(anchor=tk.W, padx=15, pady=(10, 15))
        
        # Specs grid
        self.specs_grid = tk.Frame(specs_frame, bg="#0a0a0a")
        self.specs_grid.pack(fill=tk.X, padx=15)
        
        # Create spec labels
        self.spec_labels = {}
        specs = [
            ("CPU", "Scanning..."),
            ("Cores", "-"),
            ("RAM", "-"),
            ("OS", "-"),
            ("Device ID", "-"),
        ]
        
        for i, (label, value) in enumerate(specs):
            row = i // 2
            col = (i % 2) * 2
            
            tk.Label(self.specs_grid, text=f"{label}:", bg="#0a0a0a", fg="#888888",
                    font=("Segoe UI", 10)).grid(row=row, column=col, sticky=tk.W, padx=(0, 10), pady=5)
            
            val_label = tk.Label(self.specs_grid, text=value, bg="#0a0a0a", fg="#00d4ff",
                               font=("Segoe UI", 10, "bold"))
            val_label.grid(row=row, column=col+1, sticky=tk.W, pady=5)
            self.spec_labels[label] = val_label
            
            # Add spacing between columns
            if col == 0:
                self.specs_grid.grid_columnconfigure(col+1, minsize=150)
        
        # Scan button
        self.scan_btn = tk.Button(main_frame, text="🔍 Scan My Computer", 
                                 bg="#00d4ff", fg="#000000", font=("Segoe UI", 12, "bold"),
                                 activebackground="#00a8cc", activeforeground="#000000",
                                 relief=tk.FLAT, cursor="hand2", padx=30, pady=12,
                                 command=self.scan_hardware)
        self.scan_btn.pack(pady=(0, 20))
        
        # Login Frame
        login_frame = tk.Frame(main_frame, bg="#0a0a0a", bd=1, relief=tk.SOLID)
        login_frame.pack(fill=tk.X, pady=(0, 20), ipady=15)
        
        tk.Label(login_frame, text="LOGIN", bg="#0a0a0a", fg="#666666",
                font=("Segoe UI", 9, "bold")).pack(anchor=tk.W, padx=15, pady=(10, 10))
        
        tk.Label(login_frame, text="Enter your RunCor username:", bg="#0a0a0a", fg="#cccccc",
                font=("Segoe UI", 10)).pack(anchor=tk.W, padx=15, pady=(0, 5))
        
        self.username_entry = tk.Entry(login_frame, font=("Segoe UI", 12), 
                                      bg="#1a1a1a", fg="#ffffff", relief=tk.FLAT,
                                      insertbackground="#ffffff")
        self.username_entry.pack(fill=tk.X, padx=15, pady=5, ipady=8)
        
        # API URL
        tk.Label(login_frame, text="API URL:", bg="#0a0a0a", fg="#888888",
                font=("Segoe UI", 9)).pack(anchor=tk.W, padx=15, pady=(10, 0))
        
        self.api_entry = tk.Entry(login_frame, font=("Segoe UI", 10), 
                                 bg="#1a1a1a", fg="#888888", relief=tk.FLAT)
        self.api_entry.insert(0, "http://localhost:3000")
        self.api_entry.pack(fill=tk.X, padx=15, pady=5, ipady=5)
        
        # Register button
        self.register_btn = tk.Button(main_frame, text="📡 Register Device", 
                                     bg="#00d4ff", fg="#000000", font=("Segoe UI", 12, "bold"),
                                     activebackground="#00a8cc", activeforeground="#000000",
                                     relief=tk.FLAT, cursor="hand2", padx=30, pady=12,
                                     command=self.register_device, state=tk.DISABLED)
        self.register_btn.pack(pady=(0, 10))
        
        # Log area
        tk.Label(main_frame, text="LOG", bg="#000000", fg="#666666",
                font=("Segoe UI", 9, "bold")).pack(anchor=tk.W, pady=(0, 5))
        
        self.log_text = tk.Text(main_frame, height=8, bg="#0a0a0a", fg="#00ff00",
                               font=("Consolas", 9), relief=tk.FLAT, state=tk.DISABLED)
        self.log_text.pack(fill=tk.X)
        
        # Footer
        ttk.Label(main_frame, text="RunCor Agent v1.0 | Windows Hardware Registration",
                 style="Subheader.TLabel").pack(pady=(15, 0))
        
    def log(self, message):
        """Add a message to the log"""
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, f"> {message}\n")
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)
        
    def update_spec(self, label, value, color="#00d4ff"):
        """Update a spec label"""
        if label in self.spec_labels:
            self.spec_labels[label].config(text=value, fg=color)
            
    def scan_hardware(self):
        """Scan hardware in a separate thread"""
        self.scan_btn.config(state=tk.DISABLED, text="Scanning...")
        self.status_var.set("Detecting hardware...")
        self.log("Starting hardware detection...")
        
        thread = threading.Thread(target=self._do_scan)
        thread.daemon = True
        thread.start()
        
    def _do_scan(self):
        """Perform the actual hardware scan"""
        try:
            info = {}
            
            if WMI_AVAILABLE:
                self.log("Using WMI for hardware detection")
                c = wmi.WMI()
                
                # CPU
                self.log("Detecting CPU...")
                cpu = c.Win32_Processor()[0]
                info['cpu'] = cpu.Name.strip()
                info['cpu_cores'] = cpu.NumberOfCores
                info['cpu_freq'] = cpu.MaxClockSpeed
                self.update_spec("CPU", info['cpu'][:30] + "..." if len(info['cpu']) > 30 else info['cpu'])
                self.update_spec("Cores", str(info['cpu_cores']))
                self.log(f"CPU: {info['cpu']}")
                
                # RAM
                self.log("Detecting RAM...")
                computer = c.Win32_ComputerSystem()[0]
                ram_gb = round(computer.TotalPhysicalMemory / (1024**3))
                info['ram'] = ram_gb
                self.update_spec("RAM", f"{ram_gb} GB")
                self.log(f"RAM: {ram_gb} GB")
                
                # OS
                self.log("Detecting OS...")
                os_info = c.Win32_OperatingSystem()[0]
                info['os'] = os_info.Caption.strip()
                info['os_version'] = os_info.Version
                self.update_spec("OS", "Windows " + ("11" if "11" in info['os'] else "10"))
                self.log(f"OS: {info['os']}")
                
                # Device ID from UUID
                self.log("Generating device ID...")
                product = c.Win32_ComputerSystemProduct()[0]
                uuid = product.UUID.replace("-", "")
                self.device_id = f"0x{uuid[:16]}"
                info['device_id'] = self.device_id
                self.update_spec("Device ID", self.device_id[:20] + "...")
                self.log(f"Device ID: {self.device_id}")
                
                # GPU detection
                try:
                    gpus = c.Win32_VideoController()
                    if gpus:
                        gpu = gpus[0]
                        info['gpu'] = gpu.Name.strip()
                        self.log(f"GPU: {info['gpu']}")
                except:
                    info['gpu'] = None
                    
            else:
                # Fallback to platform info
                self.log("WMI not available, using basic detection")
                info['cpu'] = platform.processor() or "Intel/AMD Processor"
                info['cpu_cores'] = 4
                info['ram'] = 16
                info['os'] = f"Windows {platform.win32_ver()[1]}"
                info['os_version'] = platform.win32_ver()[1]
                self.device_id = f"0x{random.randint(10000000, 99999999)}{random.randint(10000000, 99999999)}"
                info['device_id'] = self.device_id
                
                self.update_spec("CPU", info['cpu'])
                self.update_spec("Cores", str(info['cpu_cores']))
                self.update_spec("RAM", f"{info['ram']} GB")
                self.update_spec("OS", info['os'])
                self.update_spec("Device ID", self.device_id[:20] + "...")
            
            info['architecture'] = "amd64"
            info['capabilities'] = ["cpu_compute", "windows"]
            info['max_job_ram'] = f"{info['ram'] - 4}gb"
            
            self.hardware_info = info
            self.log("Hardware detection complete!")
            self.status_var.set("✓ Hardware detected. Ready to register.")
            
            # Enable register button
            self.root.after(0, lambda: self.register_btn.config(
                state=tk.NORMAL, 
                bg="#00d4ff",
                text="📡 Register Device"
            ))
            
        except Exception as e:
            self.log(f"ERROR: {str(e)}")
            self.status_var.set("Scan failed. See log.")
            
        finally:
            self.root.after(0, lambda: self.scan_btn.config(
                state=tk.NORMAL,
                text="🔍 Scan My Computer"
            ))
            
    def register_device(self):
        """Register the device with the backend"""
        username = self.username_entry.get().strip()
        if not username:
            messagebox.showerror("Error", "Please enter a username")
            return
            
        if not self.hardware_info:
            messagebox.showerror("Error", "Please scan hardware first")
            return
            
        api_url = self.api_entry.get().strip()
        
        self.register_btn.config(state=tk.DISABLED, text="Registering...")
        self.status_var.set("Sending data to server...")
        self.log(f"Registering as user: {username}")
        
        thread = threading.Thread(target=self._do_register, args=(username, api_url))
        thread.daemon = True
        thread.start()
        
    def _do_register(self, username, api_url):
        """Perform the actual registration"""
        try:
            payload = {
                "deviceId": self.device_id,
                "username": username,
                "specs": {
                    "architecture": self.hardware_info['architecture'],
                    "cpu": self.hardware_info['cpu'],
                    "cpuCores": self.hardware_info['cpu_cores'],
                    "cpuFrequencyMHz": self.hardware_info['cpu_freq'],
                    "ramGB": self.hardware_info['ram'],
                    "os": "windows",
                    "osVersion": self.hardware_info['os_version'],
                    "capabilities": self.hardware_info['capabilities'],
                    "maxJobRAM": self.hardware_info['max_job_ram']
                },
                "status": {
                    "cpuLoadPercent": 0,
                    "ramUsedPercent": 0,
                    "jobStatus": "idle",
                    "uptimeSeconds": 0
                }
            }
            
            data = json.dumps(payload).encode('utf-8')
            url = f"{api_url}/api/devices"
            
            self.log(f"POST {url}")
            
            req = urllib.request.Request(
                url,
                data=data,
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            
            with urllib.request.urlopen(req, timeout=15) as response:
                result = json.loads(response.read().decode('utf-8'))
                
                self.log("Registration successful!")
                self.status_var.set("✓ Device registered successfully!")
                
                # Show success dialog
                self.root.after(0, lambda: self._show_success(username, api_url))
                
        except urllib.error.URLError as e:
            self.log(f"Connection error: {str(e)}")
            self.status_var.set("Failed to connect. Is the server running?")
            self.root.after(0, lambda: self.register_btn.config(
                state=tk.NORMAL, text="📡 Register Device"
            ))
            
        except Exception as e:
            self.log(f"ERROR: {str(e)}")
            self.status_var.set("Registration failed. See log.")
            self.root.after(0, lambda: self.register_btn.config(
                state=tk.NORMAL, text="📡 Register Device"
            ))
            
    def _show_success(self, username, api_url):
        """Show success message"""
        success_msg = f"""
Device registered successfully!

Username: {username}
Device ID: {self.device_id[:30]}...

View your device at:
{api_url}/dashboard/device

The device will now appear in your dashboard.
        """
        
        messagebox.showinfo("Success!", success_msg)
        
        self.register_btn.config(
            state=tk.NORMAL,
            text="✓ Registered",
            bg="#00ff00"
        )


def main():
    # Check if we need to install WMI
    if not WMI_AVAILABLE:
        print("WMI not available. Install with: pip install WMI")
    
    root = tk.Tk()
    app = RunCorAgentGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()
