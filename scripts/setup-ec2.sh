#!/usr/bin/env bash
# ============================================================
# EC2 First-Time Setup Script
# Run once on a fresh Amazon Linux 2023 / Ubuntu 22.04 instance
# Usage: sudo bash setup-ec2.sh
# ============================================================
set -euo pipefail

echo "=== Installing Java 17 ==="
if command -v amazon-linux-extras &>/dev/null; then
  amazon-linux-extras install java-openjdk17 -y 2>/dev/null || true
fi
apt-get install -y openjdk-17-jre-headless 2>/dev/null || \
  yum install -y java-17-amazon-corretto-headless 2>/dev/null || true

echo "=== Creating app directories ==="
mkdir -p /opt/haritha /var/log/haritha
useradd -r -s /sbin/nologin haritha 2>/dev/null || true
chown -R haritha:haritha /opt/haritha /var/log/haritha

echo "=== Writing systemd service ==="
cat > /etc/systemd/system/haritha-backend.service <<'UNIT'
[Unit]
Description=Haritha Fashion World — Spring Boot Backend
After=network.target

[Service]
User=haritha
Group=haritha
WorkingDirectory=/opt/haritha
EnvironmentFile=/opt/haritha/.env
ExecStart=/usr/bin/java \
  -Xms512m -Xmx1024m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -Dspring.profiles.active=prod \
  -jar /opt/haritha/app.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/haritha/app.log
StandardError=append:/var/log/haritha/app.log

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable haritha-backend

echo "=== Installing Nginx ==="
apt-get install -y nginx 2>/dev/null || yum install -y nginx 2>/dev/null || true

cat > /etc/nginx/sites-available/haritha <<'NGINX'
server {
    listen 80;
    server_name harithafashion.com www.harithafashion.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name harithafashion.com www.harithafashion.com;

    ssl_certificate     /etc/letsencrypt/live/harithafashion.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/harithafashion.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    location /api/ {
        proxy_pass         http://localhost:8080/api/;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        client_max_body_size 55m;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/haritha /etc/nginx/sites-enabled/haritha 2>/dev/null || true
nginx -t && systemctl restart nginx || true

echo "=== Writing .env template ==="
cat > /opt/haritha/.env.example <<'ENV'
DB_URL=jdbc:postgresql://YOUR_RDS_ENDPOINT:5432/haritha_fashion
DB_USER=haritha
DB_PASSWORD=CHANGE_ME

REDIS_HOST=YOUR_ELASTICACHE_ENDPOINT
REDIS_PORT=6379
REDIS_SSL=true

JWT_SECRET=CHANGE_THIS_TO_256_BIT_SECRET_MIN_32_CHARS

AWS_REGION=ap-south-1
S3_BUCKET=haritha-fashion-media
CLOUDFRONT_DOMAIN=https://YOUR_CLOUDFRONT.cloudfront.net

AWS_SES_SMTP_USER=YOUR_SES_SMTP_USER
AWS_SES_SMTP_PASS=YOUR_SES_SMTP_PASS

MSG91_API_KEY=YOUR_MSG91_KEY
MSG91_OTP_TEMPLATE_ID=YOUR_TEMPLATE_ID
MSG91_WA_ORDER_TEMPLATE=YOUR_WA_FLOW_ID
MSG91_WA_SHIPPED_TEMPLATE=YOUR_WA_SHIPPED_FLOW_ID

RAZORPAY_KEY_ID=rzp_live_XXXXXXXX
RAZORPAY_KEY_SECRET=YOUR_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

SHIPROCKET_EMAIL=YOUR_EMAIL
SHIPROCKET_PASSWORD=YOUR_PASSWORD
SHIPROCKET_PICKUP_LOCATION=Primary

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

CORS_ORIGINS=https://www.harithafashion.com,https://harithafashion.com
FRONTEND_URL=https://www.harithafashion.com
ENV

chown haritha:haritha /opt/haritha/.env.example

echo ""
echo "=== EC2 setup complete! ==="
echo "Next steps:"
echo "  1. Copy /opt/haritha/.env.example to /opt/haritha/.env and fill in values"
echo "  2. Set up SSL: sudo certbot --nginx -d harithafashion.com -d www.harithafashion.com"
echo "  3. Deploy app: ./scripts/deploy-prod.sh all"
