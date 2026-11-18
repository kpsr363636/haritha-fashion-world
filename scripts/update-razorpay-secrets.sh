#!/usr/bin/env bash
# Update Razorpay keys in AWS Secrets Manager and restart ECS backend.
#
# Usage:
#   RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=your_secret ./scripts/update-razorpay-secrets.sh
#
# Get keys from: https://dashboard.razorpay.com/app/keys
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-south-1}"
SECRET_ID="${SECRET_ID:-haritha/app-config}"
STACK_NAME="${STACK_NAME:-HarithaFashionStack}"

export RAZORPAY_KEY_ID="${RAZORPAY_KEY_ID:-}"
export RAZORPAY_KEY_SECRET="${RAZORPAY_KEY_SECRET:-}"
export RAZORPAY_WEBHOOK_SECRET="${RAZORPAY_WEBHOOK_SECRET:-}"

if [[ -z "$RAZORPAY_KEY_ID" || -z "$RAZORPAY_KEY_SECRET" ]]; then
  echo "ERROR: Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET"
  echo "Example:"
  echo "  RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=yyy ./scripts/update-razorpay-secrets.sh"
  exit 1
fi

log() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }

log "Updating Secrets Manager ($SECRET_ID)..."
python3 <<'PY'
import json, os, subprocess, sys

region = os.environ.get("AWS_REGION", "ap-south-1")
secret_id = os.environ.get("SECRET_ID", "haritha/app-config")
key_id = os.environ["RAZORPAY_KEY_ID"]
key_secret = os.environ["RAZORPAY_KEY_SECRET"]
webhook = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "")

get = subprocess.run(
    ["aws", "secretsmanager", "get-secret-value", "--secret-id", secret_id,
     "--region", region, "--query", "SecretString", "--output", "text"],
    capture_output=True, text=True, check=True,
)
data = json.loads(get.stdout)
data["RAZORPAY_KEY_ID"] = key_id
data["RAZORPAY_KEY_SECRET"] = key_secret
if webhook:
    data["RAZORPAY_WEBHOOK_SECRET"] = webhook

put = subprocess.run(
    ["aws", "secretsmanager", "put-secret-value", "--secret-id", secret_id,
     "--region", region, "--secret-string", json.dumps(data)],
    capture_output=True, text=True,
)
if put.returncode != 0:
    print(put.stderr, file=sys.stderr)
    sys.exit(put.returncode)
PY

CLUSTER="$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='EcsClusterName'].OutputValue" \
  --output text)"
SERVICE="$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='EcsServiceName'].OutputValue" \
  --output text)"

if [[ -n "$CLUSTER" && -n "$SERVICE" ]]; then
  log "Restarting ECS service..."
  aws ecs update-service \
    --cluster "$CLUSTER" \
    --service "$SERVICE" \
    --force-new-deployment \
    --region "$AWS_REGION" \
    --query 'service.serviceName' \
    --output text >/dev/null
  log "ECS redeploy started — wait ~2 min before retrying checkout."
fi

log "Done. Key ID: ${RAZORPAY_KEY_ID}"
