#!/usr/bin/env bash
# ============================================================
# harithafashionworld.com → CloudFront (Razorpay website match)
# DNS managed in Hostinger (ns1/ns2.dns-parking.com) — domain may be at GoDaddy
#
# Run from project root:
#   ./scripts/setup-custom-domain.sh [check|wait|deploy]
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOMAIN="${DOMAIN:-harithafashionworld.com}"
CERT_ARN="${CERT_ARN:-arn:aws:acm:us-east-1:848005667997:certificate/c0890b4e-1bcb-4461-a26e-b44c23010954}"
AWS_REGION="${AWS_REGION:-ap-south-1}"
STACK_NAME="HarithaFashionStack"
ACTION="${1:-check}"

log() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }

get_cf_domain() {
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomain'].OutputValue" \
    --output text 2>/dev/null || echo ""
}

show_validation_records() {
  log "Step 1 — ACM certificate validation (Hostinger → Domains → ${DOMAIN} → DNS / Nameservers):"
  aws acm describe-certificate \
    --certificate-arn "$CERT_ARN" \
    --region us-east-1 \
    --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
    --output table
  echo ""
  echo "  Hostinger → Add Record:"
  echo "    Type:    CNAME"
  echo "    Name:    _4418dcfc62bcdbc183500dc69889d7e1"
  echo "    Content: _cae239959d10d3b9c1c1a78c913af31e.jkddzztszm.acm-validations.aws"
  echo "    TTL:     300 (or default)"
  echo ""
  echo "  Keep MX/SPF/DKIM records — do not delete Hostinger email records."
}

show_dns_cutover() {
  local cf_domain
  cf_domain="$(get_cf_domain)"
  if [[ -z "$cf_domain" ]]; then
    log "WARN: CloudFront domain not found — deploy infra first."
    return
  fi

  log "Step 2 — After certificate is ISSUED, point domain to CloudFront (Hostinger DNS):"
  echo ""
  echo "  A) Edit existing www CNAME (currently → ${DOMAIN}):"
  echo "     Change Content to: ${cf_domain}"
  echo ""
  echo "  B) Root domain (@) — edit Redirects (left menu) OR replace A record:"
  echo "     Redirects → forward https://${DOMAIN} → https://www.${DOMAIN}"
  echo "     Then delete A @ → 145.79.210.101 and AAAA @ (IPv6) if redirect handles apex."
  echo "     Or try CNAME @ → ${cf_domain} if Hostinger allows (delete A/AAAA first)."
  echo ""
  echo "  C) Do NOT delete MX, SPF, TXT, or hostingermail-* DKIM records (keeps email working)."
  echo ""
  echo "  Step 3 — Deploy:"
  echo "    SITE_DOMAIN=${DOMAIN} ./scripts/deploy-aws.sh all"
  echo "    # or if using www only:"
  echo "    SITE_DOMAIN=www.${DOMAIN} ./scripts/deploy-aws.sh all"
  echo ""
  echo "  Step 4 — Razorpay Dashboard → Website & App Settings:"
  echo "    Add https://${DOMAIN} and https://www.${DOMAIN}"
  echo "    Shop and checkout only on the URL you configured (not the CloudFront URL)."
}

cert_status() {
  aws acm describe-certificate \
    --certificate-arn "$CERT_ARN" \
    --region us-east-1 \
    --query 'Certificate.Status' \
    --output text
}

case "$ACTION" in
  check)
    log "Domain: ${DOMAIN} (DNS at Hostinger)"
    log "Certificate status: $(cert_status)"
    show_validation_records
    show_dns_cutover
    ;;
  wait)
    log "Waiting for ACM certificate to become ISSUED (Ctrl+C to stop)..."
    while true; do
      status="$(cert_status)"
      log "Status: $status"
      [[ "$status" == "ISSUED" ]] && break
      sleep 30
    done
    log "Certificate issued. Run: $0 deploy"
    ;;
  deploy)
    status="$(cert_status)"
    if [[ "$status" != "ISSUED" ]]; then
      log "ERROR: Certificate is '$status', not ISSUED."
      log "Add the validation CNAME in Hostinger DNS first (see below)."
      show_validation_records
      exit 1
    fi
    log "Deploying infra + frontend with SITE_DOMAIN=${DOMAIN}..."
    SITE_DOMAIN="$DOMAIN" "$ROOT/scripts/deploy-aws.sh" all
    show_dns_cutover
    ;;
  *)
    echo "Usage: $0 [check|wait|deploy]"
    exit 1
    ;;
esac
