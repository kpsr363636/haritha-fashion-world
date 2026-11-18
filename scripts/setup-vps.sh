#!/usr/bin/env bash
# One-time setup of a fresh Ubuntu VPS (Hostinger KVM, "Ubuntu 22.04/24.04" template).
# Run from your Mac:   VPS_HOST=1.2.3.4 ./scripts/setup-vps.sh
# Installs Docker + Compose, opens only SSH/HTTP/HTTPS, adds 2 GB swap (Maven/npm builds need it).
set -euo pipefail

VPS_HOST="${VPS_HOST:?Set VPS_HOST to the server IP}"
VPS_USER="${VPS_USER:-root}"

ssh -o StrictHostKeyChecking=accept-new "$VPS_USER@$VPS_HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

echo ">>> Updating packages"
apt-get update -y
apt-get upgrade -y

echo ">>> Installing Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo ">>> Firewall: allow SSH, HTTP, HTTPS only"
apt-get install -y ufw rsync
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

echo ">>> Swap (2 GB) if none"
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

mkdir -p /opt/haritha
echo ">>> VPS ready. Docker: $(docker --version)"
REMOTE
