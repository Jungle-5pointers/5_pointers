#!/bin/bash

# Script to get the EC2 instance ID for PageCube-Subdomain-Simple
# This script uses AWS CLI to find the instance ID by name

echo "🔍 Finding PageCube-Subdomain-Simple instance..."

INSTANCE_ID=$(aws ec2 describe-instances \
  --region ap-northeast-2 \
  --filters "Name=tag:Name,Values=PageCube-Subdomain-Simple" "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].InstanceId' \
  --output text)

if [ -z "$INSTANCE_ID" ]; then
  echo "❌ PageCube-Subdomain-Simple instance not found or not running"
  exit 1
fi

echo "✅ Found instance: $INSTANCE_ID"
echo "🌐 Instance IP: 3.35.141.231"

# Export for use in other scripts
export PAGECUBE_SUBDOMAIN_INSTANCE_ID=$INSTANCE_ID
echo "PAGECUBE_SUBDOMAIN_INSTANCE_ID=$INSTANCE_ID"