#!/usr/bin/env bash
# ============================================================
# Haritha Fashion World — Production Deployment Script
# Target: AWS EC2 (Amazon Linux 2023 / Ubuntu 22.04)
# Usage: ./scripts/deploy-prod.sh [backend|frontend|all]
# ============================================================
set -euo pipefail

TARGET="${1:-all}"
APP_NAME="haritha-fashion"
BACKEND_JAR="backend/target/haritha-fashion-1.0.0.jar"
FRONTEND_DIST="frontend/dist"
S3_BUCKET="${S3_BUCKET:?Set S3_BUCKET env var}"
CLOUDFRONT_DIST_ID="${CLOUDFRONT_DIST_ID:-}"
EC2_USER="${EC2_USER:-ec2-user}"
EC2_HOST="${EC2_HOST:?Set EC2_HOST env var}"
EC2_KEY="${EC2_KEY:-~/.ssh/haritha-prod.pem}"

echo "========================================="
echo " Haritha Fashion World — Production Deploy"
echo " Target: $TARGET"
echo "========================================="

# ---------------------------------------------------------------
deploy_backend() {
  echo ""
  echo ">>> Building backend JAR..."
  cd backend
  ./mvnw clean package -DskipTests -Pprod
  cd ..

  echo ">>> Uploading JAR to EC2..."
  scp -i "$EC2_KEY" -o StrictHostKeyChecking=no \
    "$BACKEND_JAR" "$EC2_USER@$EC2_HOST:/opt/haritha/app-new.jar"

  echo ">>> Restarting Spring Boot service..."
  ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" bash <<'REMOTE'
    set -e
    # Swap JAR and restart
    mv /opt/haritha/app-new.jar /opt/haritha/app.jar
    sudo systemctl restart haritha-backend
    # Wait for health check
    for i in $(seq 1 30); do
      status=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/api/actuator/health || true)
      if [ "$status" = "200" ]; then
        echo "Backend healthy after ${i}s"
        exit 0
      fi
      echo "Waiting for backend... ($i/30)"
      sleep 2
    done
    echo "ERROR: Backend did not become healthy in 60s"
    exit 1
REMOTE

  echo "Backend deployed successfully."
}

# ---------------------------------------------------------------
deploy_frontend() {
  echo ""
  echo ">>> Building frontend..."
  cd frontend
  npm ci
  npm run build
  cd ..

  echo ">>> Syncing to S3..."
  # Long-lived cache for hashed assets
  aws s3 sync "$FRONTEND_DIST" "s3://$S3_BUCKET" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html" \
    --exclude "*.json" \
    --exclude "robots.txt" \
    --exclude "sitemap.xml"

  # Short cache for entry points and manifests
  aws s3 sync "$FRONTEND_DIST" "s3://$S3_BUCKET" \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "index.html" \
    --include "*.json" \
    --include "robots.txt"

  if [ -n "$CLOUDFRONT_DIST_ID" ]; then
    echo ">>> Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
      --distribution-id "$CLOUDFRONT_DIST_ID" \
      --paths "/index.html" "/manifest.json" "/service-worker.js"
    echo "CloudFront invalidation submitted."
  fi

  echo "Frontend deployed successfully."
}

# ---------------------------------------------------------------
case "$TARGET" in
  backend) deploy_backend ;;
  frontend) deploy_frontend ;;
  all) deploy_backend && deploy_frontend ;;
  *) echo "Usage: $0 [backend|frontend|all]" && exit 1 ;;
esac

echo ""
echo "========================================="
echo " Deployment complete!"
echo "========================================="
