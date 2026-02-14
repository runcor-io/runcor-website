#!/bin/bash
#
# RunCor Agent Installer
# Usage: curl -fsSL https://runcor.io/install.sh | bash
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="/usr/local/bin"
CONFIG_DIR="/etc/runcor"
SERVICE_USER="runcor"
AGENT_VERSION="${AGENT_VERSION:-latest}"
GITHUB_REPO="runcor/runcor-agent"

# Detect architecture
detect_arch() {
    local arch=$(uname -m)
    case $arch in
        x86_64|amd64)
            echo "amd64"
            ;;
        aarch64|arm64)
            echo "arm64"
            ;;
        riscv64)
            echo "riscv64"
            ;;
        *)
            echo "Unsupported architecture: $arch" >&2
            exit 1
            ;;
    esac
}

# Detect OS
detect_os() {
    local os=$(uname -s | tr '[:upper:]' '[:lower:]')
    echo "$os"
}

# Print banner
print_banner() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════╗"
    echo "║     RUNCOR SOFTWARE AGENT INSTALLER               ║"
    echo "║     Autonomous Edge Device Node Setup             ║"
    echo "╚════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${YELLOW}⚠ This script needs to run with sudo for system-wide installation${NC}"
        echo "   Run: curl -fsSL https://runcor.io/install.sh | sudo bash"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}→ Checking prerequisites...${NC}"
    
    # Check for Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}⚠ Docker not found. Installing...${NC}"
        install_docker
    else
        echo -e "${GREEN}✓ Docker installed${NC}"
    fi
    
    # Check Docker permissions
    if ! docker info &> /dev/null; then
        echo -e "${YELLOW}⚠ Docker daemon not accessible. Adding user to docker group...${NC}"
        usermod -aG docker ${SUDO_USER:-$USER} || true
    fi
    
    echo -e "${GREEN}✓ Prerequisites satisfied${NC}"
}

# Install Docker
install_docker() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        case $ID in
            ubuntu|debian)
                apt-get update
                apt-get install -y docker.io
                systemctl enable docker
                systemctl start docker
                ;;
            fedora|rhel|centos)
                dnf install -y docker
                systemctl enable docker
                systemctl start docker
                ;;
            *)
                echo -e "${RED}✗ Please install Docker manually${NC}"
                exit 1
                ;;
        esac
    fi
}

# Download agent binary
download_agent() {
    local arch=$1
    local os=$2
    local binary_name="runcor-agent-${os}-${arch}"
    
    echo -e "${YELLOW}→ Downloading RunCor Agent for ${arch}...${NC}"
    
    if [ "$AGENT_VERSION" = "latest" ]; then
        local download_url="https://github.com/${GITHUB_REPO}/releases/latest/download/${binary_name}"
    else
        local download_url="https://github.com/${GITHUB_REPO}/releases/download/${AGENT_VERSION}/${binary_name}"
    fi
    
    # Download with retry
    local retries=3
    while [ $retries -gt 0 ]; do
        if curl -fsSL -o /tmp/runcor-agent "$download_url"; then
            break
        fi
        retries=$((retries - 1))
        echo -e "${YELLOW}  Retry downloading... (${retries} attempts left)${NC}"
        sleep 2
    done
    
    if [ ! -f /tmp/runcor-agent ]; then
        echo -e "${RED}✗ Failed to download agent binary${NC}"
        exit 1
    fi
    
    chmod +x /tmp/runcor-agent
    mv /tmp/runcor-agent ${INSTALL_DIR}/runcor-agent
    
    echo -e "${GREEN}✓ Agent installed to ${INSTALL_DIR}/runcor-agent${NC}"
}

# Create directories
setup_directories() {
    echo -e "${YELLOW}→ Setting up directories...${NC}"
    
    mkdir -p ${CONFIG_DIR}
    mkdir -p /var/log/runcor
    mkdir -p /var/lib/runcor
    
    # Create user if not exists
    if ! id -u ${SERVICE_USER} &>/dev/null; then
        useradd -r -s /bin/false -d /var/lib/runcor ${SERVICE_USER}
    fi
    
    # Set permissions
    chown -R ${SERVICE_USER}:${SERVICE_USER} ${CONFIG_DIR}
    chown -R ${SERVICE_USER}:${SERVICE_USER} /var/log/runcor
    chown -R ${SERVICE_USER}:${SERVICE_USER} /var/lib/runcor
    
    echo -e "${GREEN}✓ Directories configured${NC}"
}

# Create default config
create_config() {
    echo -e "${YELLOW}→ Creating default configuration...${NC}"
    
    cat > ${CONFIG_DIR}/config.yaml <<EOF
# RunCor Agent Configuration
# Generated on $(date)

device:
  name: "$(hostname)-node"
  max_jobs: 1
  max_ram_gb: 2.0

backend:
  api_url: "api.runcor.io:443"
  heartbeat_interval: 30

executor:
  docker_image: "riscv64/python:3.11-alpine"
  network_enabled: false
  cleanup_after_run: true
  max_job_hours: 2

logging:
  level: "info"
  output: "stdout"
EOF
    
    chown ${SERVICE_USER}:${SERVICE_USER} ${CONFIG_DIR}/config.yaml
    chmod 640 ${CONFIG_DIR}/config.yaml
    
    echo -e "${GREEN}✓ Configuration created at ${CONFIG_DIR}/config.yaml${NC}"
}

# Install systemd service
install_service() {
    echo -e "${YELLOW}→ Installing systemd service...${NC}"
    
    cat > /etc/systemd/system/runcor-agent.service <<EOF
[Unit]
Description=RunCor Software Agent
Documentation=https://docs.runcor.io
After=docker.service network.target
Wants=docker.service

[Service]
Type=simple
User=${SERVICE_USER}
Group=${SERVICE_USER}
ExecStart=${INSTALL_DIR}/runcor-agent --config ${CONFIG_DIR}/config.yaml
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=runcor-agent

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/log/runcor /var/lib/runcor ${CONFIG_DIR}

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable runcor-agent
    
    echo -e "${GREEN}✓ Systemd service installed${NC}"
}

# Run first-time setup
first_time_setup() {
    echo -e "${YELLOW}→ Running first-time setup...${NC}"
    
    # Generate device identity
    ${INSTALL_DIR}/runcor-agent --spec
    
    echo -e "${GREEN}✓ Device identity generated${NC}"
}

# Print completion message
print_completion() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     INSTALLATION COMPLETE                          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Quick start commands:"
    echo ""
    echo "  View device specs:"
    echo "    runcor-agent --spec"
    echo ""
    echo "  Start the agent:"
    echo "    sudo systemctl start runcor-agent"
    echo ""
    echo "  Check status:"
    echo "    sudo systemctl status runcor-agent"
    echo ""
    echo "  View logs:"
    echo "    sudo journalctl -u runcor-agent -f"
    echo ""
    echo "  Edit configuration:"
    echo "    sudo nano ${CONFIG_DIR}/config.yaml"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Start the agent: sudo systemctl start runcor-agent"
    echo "  2. Check dashboard: https://runcor.io/dashboard"
    echo "  3. Your device should appear as 'online' within 30 seconds"
    echo ""
}

# Main installation flow
main() {
    print_banner
    
    check_root
    
    local arch=$(detect_arch)
    local os=$(detect_os)
    
    echo -e "Detected: ${GREEN}${os}/${arch}${NC}"
    echo ""
    
    check_prerequisites
    download_agent $arch $os
    setup_directories
    create_config
    install_service
    first_time_setup
    
    print_completion
}

# Run main function
main "$@"
