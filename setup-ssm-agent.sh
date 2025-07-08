#!/bin/bash
# EC2 인스턴스에서 실행할 SSM Agent 설치 스크립트

echo "🔧 Installing SSM Agent..."

# Ubuntu/Debian
if command -v apt-get &> /dev/null; then
    sudo apt-get update -y
    sudo apt-get install -y amazon-ssm-agent
    sudo systemctl enable amazon-ssm-agent
    sudo systemctl start amazon-ssm-agent
fi

# Amazon Linux
if command -v yum &> /dev/null; then
    sudo yum install -y amazon-ssm-agent
    sudo systemctl enable amazon-ssm-agent
    sudo systemctl start amazon-ssm-agent
fi

echo "✅ SSM Agent installation completed"
echo "🔍 Status: $(sudo systemctl is-active amazon-ssm-agent)"
