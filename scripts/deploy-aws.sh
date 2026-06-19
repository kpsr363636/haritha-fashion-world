#!/usr/bin/env bash
# ============================================================
# Haritha Fashion World — Full AWS Deployment
# Deploys CDK stack, pushes backend Docker image, syncs frontend
#
# Prerequisites:
#   - AWS CLI v2 configured (aws configure)
#   - Docker running
#   - Node.js 20+
#   - CDK bootstrapped once: cd infrastructure && npx cdk bootstrap
#
# Usage:
#   ./scripts/deploy-aws.sh [infra|backend|frontend|all]
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-all}"
AWS_REGION="${AWS_REGION:-ap-south-1}"
STACK_NAME="HarithaFashionStack"

log() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { log "ERROR: '$1' not found"; exit 1; }
}

get_output() {
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" \
    --output text 2>/dev/null || echo ""
}

deploy_infra() {
  log "Deploying AWS infrastructure (CDK)..."
  cd "$ROOT/infrastructure"
  npm ci --silent
  npm run build
  npx cdk deploy --all --require-approval never --outputs-file "$ROOT/infrastructure/cdk-outputs.json"
  cd "$ROOT"
  log "Infrastructure deployed."
}

deploy_backend() {
  local ecr_uri cluster service
  ecr_uri="$(get_output EcrRepositoryUri)"
  cluster="$(get_output EcsClusterName)"
  service="$(get_output EcsServiceName)"
  if [[ -z "$ecr_uri" || -z "$cluster" || -z "$service" ]]; then
    log "ERROR: Stack not deployed or ECS outputs missing. Run: ./scripts/deploy-aws.sh infra"
    exit 1
  fi

  log "Building backend Docker image..."
  aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "${ecr_uri%%/*}"

  docker build --platform linux/amd64 -t haritha-backend:latest "$ROOT/backend"
  docker tag haritha-backend:latest "$ecr_uri:latest"
  docker push "$ecr_uri:latest"

  log "Forcing ECS service redeploy ($cluster / $service)..."
  aws ecs update-service \
    --cluster "$cluster" \
    --service "$service" \
    --desired-count 1 \
    --force-new-deployment \
    --region "$AWS_REGION" \
    --query 'service.serviceName' \
    --output text

  log "Waiting for service stability (up to 10 min)..."
  aws ecs wait services-stable --cluster "$cluster" --services "$service" --region "$AWS_REGION"
  log "Backend deployed."
}

deploy_frontend() {
  local bucket cf_domain cf_id site_url public_base api_url
  bucket="$(get_output FrontendBucketName)"
  cf_domain="$(get_output CloudFrontDomain)"
  cf_id="$(get_output CloudFrontDistributionId)"
  site_url="$(get_output SiteUrl)"

  if [[ -z "$bucket" ]]; then
    log "ERROR: Stack not deployed. Run: ./scripts/deploy-aws.sh infra"
    exit 1
  fi

  # Use custom domain for public URLs when SITE_DOMAIN is set (must match Razorpay whitelist).
  public_base="${SITE_DOMAIN:+https://${SITE_DOMAIN}}"
  public_base="${public_base:-${site_url:-https://${cf_domain}}}"
  api_url="${public_base}/api"

  log "Downloading real demo images..."
  chmod +x "$ROOT/scripts/download-demo-images.sh"
  "$ROOT/scripts/download-demo-images.sh" --force || log "WARN: Some images failed to download"

  log "Downloading 40 saree catalog images..."
  chmod +x "$ROOT/scripts/download-saree-images.sh"
  "$ROOT/scripts/download-saree-images.sh" --force || log "WARN: Some saree images failed to download"

  log "Building frontend (API → ${api_url})..."
  cd "$ROOT/frontend"
  npm ci --silent
  VITE_API_URL="$api_url" \
    VITE_SITE_URL="$public_base" \
    VITE_RAZORPAY_REDIRECT="${VITE_RAZORPAY_REDIRECT:-true}" \
    npm run build
  cd "$ROOT"

  log "Syncing to S3 bucket: $bucket"
  aws s3 sync "$ROOT/frontend/dist" "s3://$bucket" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html" \
    --exclude "*.json" \
    --exclude "robots.txt"

  aws s3 sync "$ROOT/frontend/dist" "s3://$bucket" \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "index.html" \
    --include "*.json" \
    --include "robots.txt"

  if [[ -n "$cf_id" ]]; then
    log "Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
      --distribution-id "$cf_id" \
      --paths "/*" \
      --query 'Invalidation.Id' \
      --output text
  fi

  log "Frontend deployed → ${site_url:-https://${cf_domain}}"
}

# ── Main ──
require_cmd aws
require_cmd docker
require_cmd node
require_cmd npm

log "Haritha Fashion World — AWS Deploy ($TARGET)"
log "Region: $AWS_REGION"

case "$TARGET" in
  infra)    deploy_infra ;;
  backend)  deploy_backend ;;
  frontend) deploy_frontend ;;
  all)
    deploy_infra
    deploy_backend
    deploy_frontend
    ;;
  *)
    echo "Usage: $0 [infra|backend|frontend|all]"
    exit 1
    ;;
esac

log "========================================="
log " Deployment complete!"
if [[ "$TARGET" == "all" || "$TARGET" == "frontend" || "$TARGET" == "infra" ]]; then
  site="$(get_output SiteUrl)"
  [[ -n "$site" ]] && log " Live site: $site"
fi
log "========================================="
log ""
log "Post-deploy checklist:"
log "  1. Update Secrets Manager 'haritha/app-config' with Razorpay, MSG91, Google keys"
log "  2. Restart ECS service after updating secrets"
  log "  3. Custom domain: ./scripts/setup-custom-domain.sh (harithafashionworld.com → CloudFront)"
log "  4. Run seed once if needed: connect to RDS and apply migrations run via Flyway on startup"
