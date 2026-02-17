#!/usr/bin/env python3
"""
RunCor Agent - Professional GUI
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
import hashlib
from pathlib import Path
from datetime import datetime

# Import Docker utilities
try:
    from docker_utils import DockerManager
    DOCKER_AVAILABLE = True
except ImportError:
    DOCKER_AVAILABLE = False
    print("Warning: docker_utils.py not found. Docker support disabled.")

# Configuration - Default to production
API_URL = "https://runcor.io"
DEVICE_ID = None
USERNAME = None
AUTH_CREDENTIALS = None
CAPABILITIES = []
POLL_INTERVAL = 10
CURRENT_JOB = None
STOP_EVENT = threading.Event()
GUI_OPEN = True

# Colors - Dark Professional Theme
COLORS = {
    'bg': '#0d1117',
    'bg_secondary': '#161b22',
    'bg_tertiary': '#21262d',
    'border': '#30363d',
    'text': '#c9d1d9',
    'text_secondary': '#8b949e',
    'accent': '#58a6ff',
    'accent_hover': '#79b8ff',
    'success': '#3fb950',
    'warning': '#d29922',
    'danger': '#f85149',
    'info': '#58a6ff'
}

class RunCorAgentGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("RunCor Agent")
        self.root.geometry("1000x750")
        self.root.minsize(900, 650)
        self.root.configure(bg=COLORS['bg'])
        
        # State
        self.logged_in = False
        self.device_registered = False
        self.hardware_info = None
        self.worker_thread = None
        self.heartbeat_thread = None
        self.jobs_completed = 0
        self.total_earned = 0.0
        self.paused = False
        self.estopped = False
        self.start_time = time.time()
        
        # Docker Manager (initialized after UI)
        self.docker = None
        self.use_docker = False
        
        # Create widgets first
        self.create_styles()
        self.create_widgets()
        self.center_window()
        
        # Now initialize Docker (UI is ready)
        self._init_docker()
        
    def _init_docker(self):
        """Initialize Docker after UI is ready"""
        if DOCKER_AVAILABLE:
            self.docker = DockerManager(logger=self.log)
            self.use_docker = self.docker.available
            if self.use_docker:
                self.log("Docker support enabled", "SUCCESS")
                # Pull base images in background
                threading.Thread(target=self._preload_docker_images, daemon=True).start()
            else:
                self.log("Docker not detected. Jobs will run natively (less secure).", "WARN")
                self.log("Click 'Install Docker Desktop' button in Device panel for secure containers.", "INFO")
        else:
            self.log("Docker module not available. Jobs will run natively.", "WARN")
        
    def _preload_docker_images(self):
        """Preload Docker images in background"""
        if self.docker:
            self.docker.pull_image("python:3.11-slim")
            self.log("Docker images ready")
        
    def create_styles(self):
        """Configure professional dark theme styles"""
        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        # Configure base styles
        self.style.configure('.', 
                           background=COLORS['bg'],
                           foreground=COLORS['text'],
                           fieldbackground=COLORS['bg_secondary'],
                           troughcolor=COLORS['bg_tertiary'])
        
        # Frame styles
        self.style.configure('Card.TFrame', 
                           background=COLORS['bg_secondary'],
                           relief='flat')
        
        self.style.configure('Bordered.TFrame',
                           background=COLORS['bg_secondary'],
                           relief='solid',
                           borderwidth=1)
        
        # Label styles
        self.style.configure('Title.TLabel',
                           background=COLORS['bg'],
                           foreground=COLORS['text'],
                           font=('Segoe UI', 24, 'bold'))
        
        self.style.configure('Header.TLabel',
                           background=COLORS['bg_secondary'],
                           foreground=COLORS['text'],
                           font=('Segoe UI', 14, 'bold'))
        
        self.style.configure('Subtitle.TLabel',
                           background=COLORS['bg_secondary'],
                           foreground=COLORS['text_secondary'],
                           font=('Segoe UI', 11))
        
        self.style.configure('Status.TLabel',
                           background=COLORS['bg_secondary'],
                           foreground=COLORS['text_secondary'],
                           font=('Segoe UI', 10))
        
        # Button styles
        self.style.configure('Accent.TButton',
                           background=COLORS['accent'],
                           foreground='#ffffff',
                           font=('Segoe UI', 11, 'bold'),
                           padding=(20, 10))
        
        self.style.map('Accent.TButton',
                      background=[('active', COLORS['accent_hover']), ('pressed', COLORS['accent'])],
                      foreground=[('active', '#ffffff')])
        
        self.style.configure('Secondary.TButton',
                           background=COLORS['bg_tertiary'],
                           foreground=COLORS['text'],
                           font=('Segoe UI', 10),
                           padding=(15, 8))
        
        self.style.map('Secondary.TButton',
                      background=[('active', COLORS['border'])])
        
        self.style.configure('Danger.TButton',
                           background=COLORS['danger'],
                           foreground='#ffffff',
                           font=('Segoe UI', 10, 'bold'),
                           padding=(15, 8))
        
        # Entry styles
        self.style.configure('Custom.TEntry',
                           fieldbackground=COLORS['bg_tertiary'],
                           foreground=COLORS['text'],
                           insertcolor=COLORS['text'],
                           padding=8)
        
        # LabelFrame styles
        self.style.configure('Custom.TLabelframe',
                           background=COLORS['bg_secondary'],
                           borderwidth=1,
                           relief='solid')
        
        self.style.configure('Custom.TLabelframe.Label',
                           background=COLORS['bg_secondary'],
                           foreground=COLORS['accent'],
                           font=('Segoe UI', 11, 'bold'))
        
    def center_window(self):
        """Center the window on screen"""
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
        
    def create_widgets(self):
        """Create the professional GUI widgets"""
        # Main container
        self.main_frame = tk.Frame(self.root, bg=COLORS['bg'])
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Header
        self.create_header()
        
        # Content area
        self.content_frame = tk.Frame(self.main_frame, bg=COLORS['bg'])
        self.content_frame.pack(fill=tk.BOTH, expand=True, pady=(20, 0))
        
        # Login view
        self.login_frame = self.create_login_card()
        
        # Dashboard view (hidden initially)
        self.dashboard_frame = self.create_dashboard()
        
        # Log section
        self.create_log_section()
        
        # Show login initially
        self.show_login()
        
    def create_header(self):
        """Create modern header"""
        header = tk.Frame(self.main_frame, bg=COLORS['bg'])
        header.pack(fill=tk.X)
        
        # Logo and title
        title_frame = tk.Frame(header, bg=COLORS['bg'])
        title_frame.pack(side=tk.LEFT)
        
        # Lightning bolt icon using unicode
        logo = tk.Label(title_frame, text="⚡", font=('Segoe UI', 32), 
                       bg=COLORS['bg'], fg=COLORS['accent'])
        logo.pack(side=tk.LEFT, padx=(0, 10))
        
        title = tk.Label(title_frame, text="RUNCOR", font=('Segoe UI', 24, 'bold'),
                        bg=COLORS['bg'], fg=COLORS['text'])
        title.pack(side=tk.LEFT)
        
        subtitle = tk.Label(title_frame, text="AGENT", font=('Segoe UI', 14),
                           bg=COLORS['bg'], fg=COLORS['accent'])
        subtitle.pack(side=tk.LEFT, padx=(5, 0), pady=(8, 0))
        
        # Status badge
        self.status_frame = tk.Frame(header, bg=COLORS['bg_tertiary'], 
                                    highlightbackground=COLORS['border'],
                                    highlightthickness=1)
        self.status_frame.pack(side=tk.RIGHT, padx=10)
        
        # Status dot
        self.status_dot = tk.Canvas(self.status_frame, width=10, height=10, 
                                   bg=COLORS['bg_tertiary'], highlightthickness=0)
        self.status_dot.pack(side=tk.LEFT, padx=(10, 5))
        self.status_dot.create_oval(2, 2, 8, 8, fill=COLORS['text_secondary'], tags='dot')
        
        self.status_text = tk.Label(self.status_frame, text="Disconnected", 
                                   font=('Segoe UI', 10),
                                   bg=COLORS['bg_tertiary'], fg=COLORS['text_secondary'])
        self.status_text.pack(side=tk.LEFT, padx=(0, 10), pady=5)
        
    def create_login_card(self):
        """Create modern login card"""
        card = tk.Frame(self.content_frame, bg=COLORS['bg_secondary'],
                       highlightbackground=COLORS['border'],
                       highlightthickness=1)
        
        # Center the card
        card.place(relx=0.5, rely=0.45, anchor='center', width=500)
        
        # Card padding frame
        inner = tk.Frame(card, bg=COLORS['bg_secondary'])
        inner.pack(fill=tk.BOTH, expand=True, padx=40, pady=40)
        
        # Title
        title = tk.Label(inner, text="Connect Device", font=('Segoe UI', 18, 'bold'),
                        bg=COLORS['bg_secondary'], fg=COLORS['text'])
        title.pack(anchor='w', pady=(0, 5))
        
        subtitle = tk.Label(inner, text="Enter your credentials to join the RunCor network",
                           font=('Segoe UI', 11),
                           bg=COLORS['bg_secondary'], fg=COLORS['text_secondary'])
        subtitle.pack(anchor='w', pady=(0, 25))
        
        # Form fields
        self.create_form_field(inner, "Username", "username_entry")
        self.create_form_field(inner, "Password", "password_entry", show="•")
        self.create_form_field(inner, "Server URL", "api_url_entry", default=API_URL)
        
        # Server hint
        hint = tk.Label(inner, text="Default: https://runcor.io", 
                       font=('Segoe UI', 9),
                       bg=COLORS['bg_secondary'], fg=COLORS['text_secondary'])
        hint.pack(anchor='w', padx=2)
        
        # Connect button
        self.login_btn = tk.Button(inner, text="Connect Device", 
                                  bg=COLORS['accent'], fg='white',
                                  font=('Segoe UI', 12, 'bold'),
                                  relief='flat', cursor='hand2',
                                  padx=30, pady=12,
                                  command=self.on_login)
        self.login_btn.pack(fill=tk.X, pady=(25, 0))
        
        # Button hover effects
        self.login_btn.bind('<Enter>', lambda e: self.login_btn.configure(bg=COLORS['accent_hover']))
        self.login_btn.bind('<Leave>', lambda e: self.login_btn.configure(bg=COLORS['accent']))
        
        # Hardware preview
        self.hw_preview = tk.Label(inner, text="Ready to detect hardware",
                                  font=('Segoe UI', 10),
                                  bg=COLORS['bg_secondary'], fg=COLORS['text_secondary'])
        self.hw_preview.pack(pady=(20, 0))
        
        return card
        
    def create_form_field(self, parent, label, attr_name, show=None, default=""):
        """Create a form field with label"""
        frame = tk.Frame(parent, bg=COLORS['bg_secondary'])
        frame.pack(fill=tk.X, pady=(0, 15))
        
        lbl = tk.Label(frame, text=label, font=('Segoe UI', 10, 'bold'),
                      bg=COLORS['bg_secondary'], fg=COLORS['text'])
        lbl.pack(anchor='w', pady=(0, 5))
        
        entry = tk.Entry(frame, font=('Segoe UI', 11),
                        bg=COLORS['bg_tertiary'], fg=COLORS['text'],
                        insertbackground=COLORS['text'],
                        relief='flat', highlightthickness=1,
                        highlightbackground=COLORS['border'],
                        highlightcolor=COLORS['accent'],
                        show=show if show else '')
        entry.pack(fill=tk.X, ipady=8, padx=1)
        entry.insert(0, default)
        
        setattr(self, attr_name, entry)
        
    def create_dashboard(self):
        """Create professional dashboard"""
        dashboard = tk.Frame(self.content_frame, bg=COLORS['bg'])
        
        # Two column layout
        dashboard.grid_columnconfigure(0, weight=1)
        dashboard.grid_columnconfigure(1, weight=2)
        dashboard.grid_rowconfigure(0, weight=1)
        
        # Left panel - Device Info
        left_panel = self.create_device_panel(dashboard)
        left_panel.grid(row=0, column=0, sticky='nsew', padx=(0, 10))
        
        # Right panel - Job Status & Stats
        right_panel = self.create_job_panel(dashboard)
        right_panel.grid(row=0, column=1, sticky='nsew')
        
        return dashboard
        
    def create_device_panel(self, parent):
        """Create device information panel"""
        panel = tk.Frame(parent, bg=COLORS['bg_secondary'],
                        highlightbackground=COLORS['border'],
                        highlightthickness=1)
        
        # Header
        header = tk.Frame(panel, bg=COLORS['bg_tertiary'])
        header.pack(fill=tk.X)
        
        icon = tk.Label(header, text="💻", font=('Segoe UI', 16),
                       bg=COLORS['bg_tertiary'], fg=COLORS['text'])
        icon.pack(side=tk.LEFT, padx=15, pady=10)
        
        title = tk.Label(header, text="Device Information", 
                        font=('Segoe UI', 13, 'bold'),
                        bg=COLORS['bg_tertiary'], fg=COLORS['text'])
        title.pack(side=tk.LEFT)
        
        # Content
        content = tk.Frame(panel, bg=COLORS['bg_secondary'])
        content.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
        
        self.device_info_text = tk.Text(content, 
                                       font=('Consolas', 10),
                                       bg=COLORS['bg_secondary'], 
                                       fg=COLORS['text'],
                                       relief='flat',
                                       wrap=tk.WORD,
                                       height=10)
        self.device_info_text.pack(fill=tk.BOTH, expand=True)
        self.device_info_text.insert(tk.END, "Waiting for device registration...")
        self.device_info_text.config(state=tk.DISABLED)
        
        # Docker install button (shown if Docker not available)
        self.docker_install_frame = tk.Frame(content, bg=COLORS['bg_secondary'])
        self.docker_install_frame.pack(fill=tk.X, pady=(10, 0))
        
        self.docker_install_btn = tk.Button(
            self.docker_install_frame,
            text="Install Docker Desktop",
            bg=COLORS['accent'],
            fg='white',
            font=('Segoe UI', 10, 'bold'),
            relief='flat',
            cursor='hand2',
            padx=20,
            pady=8,
            command=self.install_docker
        )
        self.docker_install_btn.pack(fill=tk.X)
        
        # Hide initially, shown in update_device_info if needed
        self.docker_install_frame.pack_forget()
        
        return panel
        
    def create_job_panel(self, parent):
        """Create job status panel"""
        panel = tk.Frame(parent, bg=COLORS['bg'])
        
        # Stats cards row
        stats_frame = tk.Frame(panel, bg=COLORS['bg'])
        stats_frame.pack(fill=tk.X, pady=(0, 10))
        stats_frame.grid_columnconfigure(0, weight=1)
        stats_frame.grid_columnconfigure(1, weight=1)
        stats_frame.grid_columnconfigure(2, weight=1)
        
        # Jobs completed card
        self.jobs_card = self.create_stat_card(stats_frame, "Jobs Completed", "0", 
                                              COLORS['success'], 0, 0)
        # Earnings card
        self.earnings_card = self.create_stat_card(stats_frame, "Total Earned", "$0.00",
                                                  COLORS['accent'], 0, 1)
        # Status card
        self.job_status_card = self.create_stat_card(stats_frame, "Status", "Idle",
                                                    COLORS['text_secondary'], 0, 2)
        
        # Job details panel
        job_details = tk.Frame(panel, bg=COLORS['bg_secondary'],
                              highlightbackground=COLORS['border'],
                              highlightthickness=1)
        job_details.pack(fill=tk.BOTH, expand=True)
        
        # Job header
        job_header = tk.Frame(job_details, bg=COLORS['bg_tertiary'])
        job_header.pack(fill=tk.X)
        
        icon = tk.Label(job_header, text="⚙️", font=('Segoe UI', 16),
                       bg=COLORS['bg_tertiary'], fg=COLORS['text'])
        icon.pack(side=tk.LEFT, padx=15, pady=10)
        
        title = tk.Label(job_header, text="Current Job",
                        font=('Segoe UI', 13, 'bold'),
                        bg=COLORS['bg_tertiary'], fg=COLORS['text'])
        title.pack(side=tk.LEFT)
        
        # Progress bar
        self.progress_frame = tk.Frame(job_details, bg=COLORS['bg_secondary'])
        self.progress_frame.pack(fill=tk.X, padx=15, pady=15)
        
        self.job_status_var = tk.StringVar(value="Waiting for jobs...")
        status_lbl = tk.Label(self.progress_frame, textvariable=self.job_status_var,
                             font=('Segoe UI', 11),
                             bg=COLORS['bg_secondary'], fg=COLORS['text'])
        status_lbl.pack(anchor='w', pady=(0, 10))
        
        # Custom progress bar
        self.progress_canvas = tk.Canvas(self.progress_frame, height=6, 
                                        bg=COLORS['bg_tertiary'], 
                                        highlightthickness=0)
        self.progress_canvas.pack(fill=tk.X)
        self.progress_fill = self.progress_canvas.create_rectangle(
            0, 0, 0, 6, fill=COLORS['accent'], outline='')
        
        # Job details text
        self.job_details = scrolledtext.ScrolledText(
            job_details, height=10,
            font=('Consolas', 10),
            bg=COLORS['bg_secondary'],
            fg=COLORS['text_secondary'],
            relief='flat',
            wrap=tk.WORD)
        self.job_details.pack(fill=tk.BOTH, expand=True, padx=15, pady=(0, 15))
        self.job_details.insert(tk.END, "No active job. The agent will automatically accept and execute jobs when available.\n")
        
        # Control buttons
        btn_frame = tk.Frame(job_details, bg=COLORS['bg_secondary'])
        btn_frame.pack(fill=tk.X, padx=15, pady=(0, 15))
        
        self.pause_btn = tk.Button(btn_frame, text="⏸ Pause",
                                  bg=COLORS['bg_tertiary'],
                                  fg=COLORS['text'],
                                  font=('Segoe UI', 10),
                                  relief='flat', cursor='hand2',
                                  padx=15, pady=8,
                                  command=self.toggle_pause)
        self.pause_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        self.estop_btn = tk.Button(btn_frame, text="⏹ E-STOP",
                                  bg=COLORS['danger'],
                                  fg='white',
                                  font=('Segoe UI', 10, 'bold'),
                                  relief='flat', cursor='hand2',
                                  padx=15, pady=8,
                                  command=self.trigger_estop)
        self.estop_btn.pack(side=tk.LEFT)
        
        disconnect_btn = tk.Button(btn_frame, text="Disconnect",
                                  bg=COLORS['bg_tertiary'],
                                  fg=COLORS['text_secondary'],
                                  font=('Segoe UI', 10),
                                  relief='flat', cursor='hand2',
                                  padx=15, pady=8,
                                  command=self.disconnect)
        disconnect_btn.pack(side=tk.RIGHT)
        
        return panel
        
    def create_stat_card(self, parent, title, value, color, row, col):
        """Create a statistic card"""
        card = tk.Frame(parent, bg=COLORS['bg_secondary'],
                       highlightbackground=COLORS['border'],
                       highlightthickness=1)
        card.grid(row=row, column=col, sticky='nsew', padx=5)
        
        # Color bar at top
        bar = tk.Frame(card, bg=color, height=3)
        bar.pack(fill=tk.X)
        
        # Content
        content = tk.Frame(card, bg=COLORS['bg_secondary'])
        content.pack(fill=tk.BOTH, expand=True, padx=15, pady=12)
        
        title_lbl = tk.Label(content, text=title.upper(),
                            font=('Segoe UI', 9),
                            bg=COLORS['bg_secondary'],
                            fg=COLORS['text_secondary'])
        title_lbl.pack(anchor='w')
        
        value_lbl = tk.Label(content, text=value,
                            font=('Segoe UI', 22, 'bold'),
                            bg=COLORS['bg_secondary'],
                            fg=color)
        value_lbl.pack(anchor='w', pady=(5, 0))
        
        return value_lbl
        
    def create_log_section(self):
        """Create modern log section"""
        log_frame = tk.Frame(self.main_frame, bg=COLORS['bg_secondary'],
                            highlightbackground=COLORS['border'],
                            highlightthickness=1)
        log_frame.pack(fill=tk.X, pady=(20, 0))
        
        # Header
        header = tk.Frame(log_frame, bg=COLORS['bg_tertiary'])
        header.pack(fill=tk.X)
        
        icon = tk.Label(header, text="📋", font=('Segoe UI', 14),
                       bg=COLORS['bg_tertiary'], fg=COLORS['text'])
        icon.pack(side=tk.LEFT, padx=15, pady=8)
        
        title = tk.Label(header, text="Agent Log",
                        font=('Segoe UI', 11, 'bold'),
                        bg=COLORS['bg_tertiary'], fg=COLORS['text'])
        title.pack(side=tk.LEFT)
        
        # Clear button
        clear_btn = tk.Button(header, text="Clear",
                             bg=COLORS['bg_tertiary'],
                             fg=COLORS['text_secondary'],
                             font=('Segoe UI', 9),
                             relief='flat', cursor='hand2',
                             padx=10, pady=2,
                             command=self.clear_log)
        clear_btn.pack(side=tk.RIGHT, padx=15)
        
        # Log text
        self.log_text = scrolledtext.ScrolledText(
            log_frame, height=8,
            font=('Consolas', 10),
            bg=COLORS['bg_secondary'],
            fg=COLORS['text_secondary'],
            relief='flat',
            wrap=tk.WORD)
        self.log_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        self.log_text.config(state=tk.DISABLED)
        
    def clear_log(self):
        """Clear the log"""
        self.log_text.config(state=tk.NORMAL)
        self.log_text.delete(1.0, tk.END)
        self.log_text.config(state=tk.DISABLED)
        
    def set_progress(self, percent):
        """Set progress bar value (0-100)"""
        width = self.progress_canvas.winfo_width()
        fill_width = (percent / 100) * width
        self.progress_canvas.coords(self.progress_fill, 0, 0, fill_width, 6)
        
    def show_login(self):
        """Show login view"""
        self.login_frame.place(relx=0.5, rely=0.45, anchor='center', width=500)
        self.dashboard_frame.grid_remove()
        self.update_status("Disconnected", COLORS['text_secondary'])
        
    def show_dashboard(self):
        """Show dashboard view"""
        self.login_frame.place_forget()
        self.dashboard_frame.pack(fill=tk.BOTH, expand=True)
        self.update_status("Connected", COLORS['success'])
        
    def update_status(self, text, color):
        """Update status indicator"""
        self.status_text.config(text=text, fg=color)
        self.status_dot.itemconfig('dot', fill=color)
        
    def log(self, message, tag="INFO"):
        """Add message to log with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        # Color based on tag
        color = COLORS['text_secondary']
        if tag == "ERROR":
            color = COLORS['danger']
        elif tag == "SUCCESS":
            color = COLORS['success']
        elif tag == "WARN":
            color = COLORS['warning']
        elif tag == "INFO":
            color = COLORS['accent']
            
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, f"[{timestamp}] ", 'timestamp')
        self.log_text.insert(tk.END, f"{tag:8} ", tag)
        self.log_text.insert(tk.END, f"{message}\n")
        
        # Configure tags
        self.log_text.tag_config('timestamp', foreground=COLORS['text_secondary'])
        self.log_text.tag_config('INFO', foreground=COLORS['accent'])
        self.log_text.tag_config('ERROR', foreground=COLORS['danger'])
        self.log_text.tag_config('SUCCESS', foreground=COLORS['success'])
        self.log_text.tag_config('WARN', foreground=COLORS['warning'])
        
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)
        
    def update_device_info(self, info):
        """Update device info display"""
        self.device_info_text.config(state=tk.NORMAL)
        self.device_info_text.delete(1.0, tk.END)
        
        # Docker status
        docker_status = "Not Available"
        if self.docker and self.docker.available:
            docker_version = self.docker.version or "Installed"
            docker_status = f"OK - {docker_version[:25]}" if len(str(docker_version)) > 25 else f"OK - {docker_version}"
        
        text = f"""Device ID:    {info.get('device_id', 'N/A')}
CPU:          {info.get('cpu', 'N/A')}
Cores:        {info.get('cpu_cores', 'N/A')}
RAM:          {info.get('ram', 'N/A')} GB
"""
        if info.get('gpu'):
            text += f"GPU:          {info.get('gpu')}\n"
            if info.get('gpu_vram'):
                text += f"GPU VRAM:     {info.get('gpu_vram')} GB\n"
        
        text += f"OS:           {info.get('os', 'N/A')}\n"
        text += f"Capabilities: {', '.join(info.get('capabilities', []))}\n"
        text += f"\nDocker:       {docker_status}\n"
        text += f"Execution:    {'Containerized (Secure)' if self.use_docker else 'Native (No Isolation)'}\n"
        
        self.device_info_text.insert(tk.END, text)
        self.device_info_text.config(state=tk.DISABLED)
        
        # Show/hide Docker install button
        if not self.use_docker and self.docker and not self.docker.available:
            self.docker_install_frame.pack(fill=tk.X, pady=(10, 0))
        else:
            self.docker_install_frame.pack_forget()
        
    def update_stats(self):
        """Update statistics cards"""
        self.jobs_card.config(text=str(self.jobs_completed))
        self.earnings_card.config(text=f"${self.total_earned:.2f}")
        
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
        self.login_btn.config(state=tk.DISABLED, text="Connecting...")
        self.hw_preview.config(text="Detecting hardware...", fg=COLORS['accent'])
        
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
                text=f"✓ Detected: {info['cpu']} | {info['ram']}GB RAM" + 
                     (f" | {info['gpu']}" if info.get('gpu') else ""),
                fg=COLORS['success']
            ))
            
            # Register device
            self.log("Registering device with RunCor...")
            success = self.register_device(info, username)
            
            if success:
                self.log("Device registered successfully!", "SUCCESS")
                self.root.after(0, self.on_registration_success)
            else:
                self.log("Registration failed - check credentials", "ERROR")
                self.root.after(0, lambda: messagebox.showerror(
                    "Registration Failed", 
                    "Could not register device. Check credentials and try again."
                ))
                self.root.after(0, lambda: self.reset_login_button())
                
        except Exception as e:
            self.log(f"Error: {str(e)}", "ERROR")
            self.root.after(0, lambda: messagebox.showerror("Error", str(e)))
            self.root.after(0, lambda: self.reset_login_button())
            
    def reset_login_button(self):
        """Reset login button state"""
        self.login_btn.config(state=tk.NORMAL, text="Connect Device")
        self.hw_preview.config(text="Ready to detect hardware", fg=COLORS['text_secondary'])
            
    def on_registration_success(self):
        """Called when registration is successful"""
        self.logged_in = True
        self.device_registered = True
        self.show_dashboard()
        self.log("Agent is now active and waiting for jobs", "SUCCESS")
        
        # Start worker threads
        self.start_workers()
        
    def detect_hardware(self):
        """Detect system hardware"""
        info = {}
        
        # CPU
        try:
            result = subprocess.run(['wmic', 'cpu', 'get', 'Name', '/format:csv'],
                                  capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                if 'Intel' in line or 'AMD' in line:
                    parts = line.split(',')
                    if len(parts) >= 2:
                        info['cpu'] = parts[1].strip()
                        break
        except:
            info['cpu'] = platform.processor() or "Unknown"
            
        # CPU Cores
        try:
            result = subprocess.run(['wmic', 'cpu', 'get', 'NumberOfCores', '/format:csv'],
                                  capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                if line.strip().isdigit():
                    info['cpu_cores'] = int(line.strip())
                    break
            if 'cpu_cores' not in info:
                info['cpu_cores'] = os.cpu_count() or 4
        except:
            info['cpu_cores'] = os.cpu_count() or 4
            
        # RAM
        try:
            result = subprocess.run(['wmic', 'computerSystem', 'get', 'TotalPhysicalMemory', '/format:csv'],
                                  capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                parts = line.split(',')
                if len(parts) >= 2 and parts[-1].strip().isdigit():
                    ram_bytes = int(parts[-1].strip())
                    info['ram'] = round(ram_bytes / (1024**3))
                    break
            if 'ram' not in info:
                info['ram'] = 8
        except:
            info['ram'] = 8
            
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
            
        info['os'] = f"Windows {platform.release()}"
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
        """Make API request with detailed logging"""
        url = f"{API_URL}{endpoint}"
        if method == "GET" and USERNAME and "?" not in endpoint:
            url += f"?username={USERNAME}"
        elif method == "GET" and USERNAME and "?" in endpoint:
            url += f"&username={USERNAME}"
        
        self.log(f"API {method} {endpoint}")
        
        try:
            headers = {'Content-Type': 'application/json'}
            request_data = None
            if data:
                request_data = json.dumps(data).encode('utf-8')
                
            req = urllib.request.Request(url, data=request_data, headers=headers, method=method)
                
            with urllib.request.urlopen(req, timeout=30) as response:
                response_data = response.read().decode('utf-8')
                return json.loads(response_data)
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8') if e.read() else "No details"
            self.log(f"HTTP {e.code}: {e.reason}", "ERROR")
            return None
        except urllib.error.URLError as e:
            self.log(f"Connection failed: {e.reason}", "ERROR")
            return None
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
        STOP_EVENT.clear()
        
        # Job polling thread
        self.worker_thread = threading.Thread(target=self.job_worker, daemon=True)
        self.worker_thread.start()
        
        # Heartbeat thread
        self.heartbeat_thread = threading.Thread(target=self.heartbeat_worker, daemon=True)
        self.heartbeat_thread.start()
        
    def job_worker(self):
        """Background thread to poll for jobs"""
        while not STOP_EVENT.is_set():
            try:
                if not self.paused and not self.estopped:
                    self.poll_and_execute_jobs()
                time.sleep(POLL_INTERVAL)
            except Exception as e:
                self.log(f"Worker error: {e}", "ERROR")
                time.sleep(5)
                
    def heartbeat_worker(self):
        """Send periodic heartbeat"""
        while not STOP_EVENT.is_set():
            try:
                self.send_heartbeat()
                time.sleep(30)
            except Exception as e:
                time.sleep(10)
                
    def send_heartbeat(self):
        """Update device heartbeat"""
        if not DEVICE_ID:
            return
            
        import psutil
        
        payload = {
            "deviceId": DEVICE_ID,
            "status": {
                "cpuLoadPercent": psutil.cpu_percent(),
                "ramUsedPercent": psutil.virtual_memory().percent,
                "jobStatus": "busy" if CURRENT_JOB else "idle",
                "uptimeSeconds": int(time.time() - self.start_time) if hasattr(self, 'start_time') else 0
            },
            "currentJob": CURRENT_JOB
        }
        
        self.api_request("POST", "/api/devices", payload)
        
    def poll_and_execute_jobs(self):
        """Check for and execute pending jobs"""
        global CURRENT_JOB
        
        # Get available jobs
        jobs = self.api_request("GET", "/api/jobs")
        if not jobs or not isinstance(jobs, list):
            return
            
        # Find first available job
        available = [j for j in jobs if j.get('status') == 'pending' and 
                     not j.get('claimedBy')]
        
        if not available:
            return
            
        job = available[0]
        job_id = job.get('_id') or job.get('id')
        
        # Claim the job
        self.log(f"Claiming job {job_id[:8]}...")
        claim_result = self.api_request("PATCH", f"/api/jobs/{job_id}", {
            "action": "claim",
            "claimedBy": USERNAME
        })
        
        if not claim_result:
            return
            
        CURRENT_JOB = job_id
        self.root.after(0, lambda: self.job_status_var.set(f"Executing: {job.get('title', 'Job')}"))
        self.root.after(0, lambda: self.job_status_card.config(text="Running", fg=COLORS['accent']))
        self.root.after(0, lambda: self.set_progress(10))
        
        # Execute the job
        success = self.execute_job(job)
        
        # Mark complete
        actual_hash = None
        if success and job.get('deterministic'):
            # Compute hash of output
            work_dir = os.path.join(tempfile.gettempdir(), f"runcor_{job_id}")
            actual_hash = self.hash_directory(work_dir)
            
        completion_data = {"status": "completed" if success else "failed"}
        if actual_hash:
            completion_data["actualOutputHash"] = actual_hash
            
        self.api_request("PATCH", f"/api/jobs/{job_id}", completion_data)
        
        CURRENT_JOB = None
        if success:
            self.jobs_completed += 1
            reward = job.get('reward', 0)
            self.total_earned += reward
            self.root.after(0, self.update_stats)
            self.log(f"Job completed! Earned ${reward:.2f}", "SUCCESS")
        
        self.root.after(0, lambda: self.job_status_var.set("Waiting for jobs..."))
        self.root.after(0, lambda: self.job_status_card.config(text="Idle", fg=COLORS['text_secondary']))
        self.root.after(0, lambda: self.set_progress(0))
        
    def execute_job(self, job):
        """Execute a job using Docker if available, otherwise native"""
        try:
            job_id = job.get('_id') or job.get('id')
            job_type = job.get('type', 'python')
            script = job.get('script', '')
            
            # Create work directory
            work_dir = os.path.join(tempfile.gettempdir(), f"runcor_{job_id}")
            os.makedirs(work_dir, exist_ok=True)
            
            # Check if we should use Docker
            use_container = (
                self.use_docker and 
                self.docker and 
                self.docker.available and
                job_type in ['python', 'powershell']
            )
            
            if use_container:
                self.log(f"🐳 Executing in Docker container (isolated)")
                return self._execute_in_docker(job, work_dir)
            else:
                self.log(f"⚠️ Executing natively (no container isolation)")
                return self._execute_native(job, work_dir)
                
        except Exception as e:
            self.log(f"Job execution failed: {e}", "ERROR")
            return False
    
    def _execute_in_docker(self, job, work_dir):
        """Execute job in Docker container"""
        job_id = job.get('_id') or job.get('id')
        job_type = job.get('type', 'python')
        script = job.get('script', '')
        
        # Get resource limits from job or use defaults
        cpu_limit = job.get('cpuLimit', '1.0')
        memory_limit = job.get('memoryLimit', '4g')
        timeout = job.get('timeout', 300)
        
        self.log(f"Resource limits: CPU={cpu_limit}, RAM={memory_limit}")
        self.log(f"Network: DISABLED (isolated)")
        
        self.root.after(0, lambda: self.job_details.delete(1.0, tk.END))
        self.root.after(0, lambda: self.job_details.insert(tk.END, 
            f"🐳 DOCKER CONTAINER\n"
            f"Job: {job.get('title')}\n"
            f"Type: {job_type}\n"
            f"Work Dir: {work_dir}\n"
            f"CPU Limit: {cpu_limit}\n"
            f"RAM Limit: {memory_limit}\n"
            f"Network: ISOLATED\n\n"
            f"Starting container...\n"
        ))
        self.root.after(0, lambda: self.set_progress(20))
        
        # Run in Docker
        success, stdout, stderr = self.docker.run_container(
            job_id=job_id,
            script_content=script,
            job_type=job_type,
            work_dir=work_dir,
            cpu_limit=str(cpu_limit),
            memory_limit=memory_limit,
            timeout=timeout
        )
        
        self.root.after(0, lambda: self.set_progress(90))
        
        # Show output
        output = f"STDOUT:\n{stdout}\n\nSTDERR:\n{stderr}"
        self.root.after(0, lambda: self.job_details.insert(tk.END, f"\n{output[:2000]}"))
        self.root.after(0, lambda: self.set_progress(100))
        
        if success:
            self.log("Container execution completed successfully", "SUCCESS")
        else:
            self.log("Container execution failed", "ERROR")
        
        return success
    
    def _execute_native(self, job, work_dir):
        """Execute job natively (fallback when Docker not available)"""
        job_id = job.get('_id') or job.get('id')
        job_type = job.get('type', 'python')
        script = job.get('script', '')
        
        self.root.after(0, lambda: self.job_details.delete(1.0, tk.END))
        self.root.after(0, lambda: self.job_details.insert(tk.END, 
            f"⚠️ NATIVE EXECUTION (No Container)\n"
            f"Job: {job.get('title')}\n"
            f"Type: {job_type}\n"
            f"Work Dir: {work_dir}\n\n"
            f"Warning: Running without container isolation!\n\n"
            f"Executing...\n"
        ))
        
        # Write and execute script
        if job_type == 'python':
            script_file = os.path.join(work_dir, "job.py")
            with open(script_file, 'w') as f:
                f.write(script)
            
            self.root.after(0, lambda: self.set_progress(30))
            result = subprocess.run(
                [sys.executable, script_file],
                cwd=work_dir,
                capture_output=True,
                text=True,
                timeout=300
            )
            self.root.after(0, lambda: self.set_progress(80))
            
        elif job_type == 'powershell':
            script_file = os.path.join(work_dir, "job.ps1")
            with open(script_file, 'w') as f:
                f.write(script)
            
            result = subprocess.run(
                ['powershell', '-ExecutionPolicy', 'Bypass', '-File', script_file],
                cwd=work_dir,
                capture_output=True,
                text=True,
                timeout=300
            )
        else:
            self.log(f"Unsupported job type: {job_type}", "ERROR")
            return False
        
        # Show output
        output = result.stdout + "\n" + result.stderr
        self.root.after(0, lambda: self.job_details.insert(tk.END, f"\nOutput:\n{output[:1000]}"))
        self.root.after(0, lambda: self.set_progress(100))
        
        return result.returncode == 0
            
    def hash_file(self, filepath):
        """Compute SHA256 hash of a file"""
        sha256 = hashlib.sha256()
        try:
            with open(filepath, 'rb') as f:
                for chunk in iter(lambda: f.read(8192), b''):
                    sha256.update(chunk)
            return f"sha256:{sha256.hexdigest()}"
        except:
            return None
            
    def hash_directory(self, directory):
        """Compute combined hash of all files in directory"""
        hashes = []
        try:
            for root, dirs, files in os.walk(directory):
                for filename in sorted(files):
                    filepath = os.path.join(root, filename)
                    file_hash = self.hash_file(filepath)
                    if file_hash:
                        hashes.append(file_hash)
            
            # Combine hashes
            combined = hashlib.sha256()
            for h in sorted(hashes):
                combined.update(h.encode())
            return f"sha256:{combined.hexdigest()}"
        except:
            return None
    
    def install_docker(self):
        """Install Docker Desktop (Windows only)"""
        if not self.docker:
            messagebox.showerror("Error", "Docker module not available")
            return
        
        if messagebox.askyesno(
            "Install Docker Desktop",
            "This will download and install Docker Desktop (~500MB).\n\n"
            "Requirements:\n"
            "- Administrator privileges\n"
            "- Windows 10/11 Pro or Enterprise\n"
            "- 5-10 minutes installation time\n\n"
            "Continue?"
        ):
            self.log("Starting Docker Desktop installation...")
            self.docker_install_btn.config(state=tk.DISABLED, text="Installing... (this may take 5-10 minutes)")
            
            def do_install():
                success = self.docker.install_docker_windows()
                self.root.after(0, lambda: self._on_docker_install_complete(success))
            
            threading.Thread(target=do_install, daemon=True).start()
    
    def _on_docker_install_complete(self, success):
        """Called when Docker installation completes"""
        if success:
            messagebox.showinfo(
                "Installation Complete",
                "Docker Desktop installed successfully!\n\n"
                "Please:\n"
                "1. Restart your computer\n"
                "2. Start Docker Desktop from the Start Menu\n"
                "3. Re-run RunCor Agent\n\n"
                "Jobs will then run in secure containers."
            )
            self.docker_install_btn.config(text="Docker Installed - Please Restart", bg=COLORS['success'])
        else:
            messagebox.showerror(
                "Installation Failed",
                "Docker Desktop installation failed.\n\n"
                "Please install manually from:\n"
                "https://www.docker.com/products/docker-desktop"
            )
            self.docker_install_btn.config(state=tk.NORMAL, text="Install Docker Desktop")
            
    def toggle_pause(self):
        """Pause/resume job processing"""
        if not hasattr(self, 'paused'):
            self.paused = False
            
        self.paused = not self.paused
        if self.paused:
            self.pause_btn.config(text="▶ Resume", bg=COLORS['success'])
            self.log("Agent paused - will not accept new jobs", "WARN")
            self.job_status_card.config(text="Paused", fg=COLORS['warning'])
        else:
            self.pause_btn.config(text="⏸ Pause", bg=COLORS['bg_tertiary'])
            self.log("Agent resumed")
            self.job_status_card.config(text="Idle", fg=COLORS['text_secondary'])
            
    def trigger_estop(self):
        """Emergency stop"""
        if messagebox.askyesno("EMERGENCY STOP", "This will immediately stop the current job.\n\nAre you sure?"):
            self.estopped = True
            self.log("EMERGENCY STOP TRIGGERED", "ERROR")
            self.job_status_card.config(text="E-STOPPED", fg=COLORS['danger'])
            # Kill current job process if running
            # (Implementation depends on how job is tracked)
            
    def disconnect(self):
        """Disconnect from server"""
        if messagebox.askyesno("Disconnect", "Stop the agent and return to login?"):
            STOP_EVENT.set()
            self.log("Disconnecting...")
            
            # Unregister device
            if DEVICE_ID:
                self.api_request("DELETE", f"/api/devices?id={DEVICE_ID}")
                
            self.logged_in = False
            self.device_registered = False
            self.show_login()
            self.reset_login_button()
            
    def on_closing(self):
        """Handle window close"""
        global GUI_OPEN
        GUI_OPEN = False
        STOP_EVENT.set()
        
        # Unregister device
        if DEVICE_ID and self.logged_in:
            try:
                self.api_request("DELETE", f"/api/devices?id={DEVICE_ID}")
            except:
                pass
                
        self.root.destroy()
        
def main():
    root = tk.Tk()
    
    # Set DPI awareness for crisp rendering on Windows
    try:
        from ctypes import windll
        windll.shcore.SetProcessDpiAwareness(1)
    except:
        pass
    
    app = RunCorAgentGUI(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()
    
if __name__ == "__main__":
    main()
