#!/bin/bash
# Run this AFTER nameservers are changed and cert is validated (~10-15 min)
# It: adds HTTPS listener to ALB, updates CloudFront with custom domain, redeploys frontend

set -e
REGION="ap-south-1"
ALB_ARN="arn:aws:elasticloadbalancing:ap-south-1:848005667997:loadbalancer/app/haritha-alb/a609455878d72b69"
TG_ARN="arn:aws:elasticloadbalancing:ap-south-1:848005667997:targetgroup/haritha-backend-tg/1151f7222c7d2187"
CERT_AP="arn:aws:acm:ap-south-1:848005667997:certificate/088305ae-bff4-4578-b1e4-79eac9d66f93"
CERT_US="arn:aws:acm:us-east-1:848005667997:certificate/c0890b4e-1bcb-4461-a26e-b44c23010954"
CF_ID="E2W0H23WZU5ZEH"

echo "Waiting for ap-south-1 cert to be issued..."
aws acm wait certificate-validated \
  --certificate-arn $CERT_AP \
  --region ap-south-1

echo "ap-south-1 cert validated ✅"

# Add HTTPS listener to ALB
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=$CERT_AP \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN \
  --region ap-south-1 2>&1 || echo "HTTPS listener may already exist"

echo "HTTPS ALB listener added ✅"

echo "Waiting for us-east-1 cert (CloudFront)..."
aws acm wait certificate-validated \
  --certificate-arn $CERT_US \
  --region us-east-1

# Update CloudFront with custom domain
CF_CONFIG=$(aws cloudfront get-distribution-config --id $CF_ID --region us-east-1 --output json)
ETAG=$(echo "$CF_CONFIG" | python3 -c "import sys,json; print(json.load(sys.stdin)['ETag'])")
echo "$CF_CONFIG" | python3 -c "
import sys, json
d = json.load(sys.stdin)
cfg = d['DistributionConfig']
cfg['Aliases'] = {'Quantity': 2, 'Items': ['harithafashionworld.com', 'www.harithafashionworld.com']}
cfg['ViewerCertificate'] = {
  'ACMCertificateArn': '$CERT_US',
  'SSLSupportMethod': 'sni-only',
  'MinimumProtocolVersion': 'TLSv1.2_2021',
  'Certificate': '$CERT_US',
  'CertificateSource': 'acm'
}
print(json.dumps(cfg))
" > /tmp/cf-final.json
aws cloudfront update-distribution \
  --id $CF_ID \
  --distribution-config file:///tmp/cf-final.json \
  --if-match $ETAG \
  --region us-east-1 --output text --query 'Distribution.Status'
echo "CloudFront custom domain applied ✅"

# Rebuild frontend with production domain
cd /Users/purushothamreddy/harithafashionworld/frontend
cat > .env.production << 'ENV'
VITE_API_URL=https://api.harithafashionworld.com/api
VITE_APP_NAME=Haritha Fashion World
VITE_BRAND_COLOR=#B5476A
ENV
npm run build
aws s3 sync dist s3://haritha-fashion-world-frontend --delete --region ap-south-1
aws cloudfront create-invalidation --distribution-id $CF_ID --paths "/*" --region us-east-1
echo "Frontend redeployed with HTTPS domain ✅"
echo ""
echo "========================================"
echo " LIVE URLS"
echo "========================================"
echo " Frontend : https://harithafashionworld.com"
echo " API      : https://api.harithafashionworld.com/api"
echo "========================================"
