#!/bin/bash
# 서브도메인 서버를 수동으로 재시작하는 스크립트

echo "🚀 Manually restarting subdomain server..."

# S3에 현재 파일들 업로드
aws s3 cp subdomain-server.js s3://elasticbeanstalk-ap-northeast-2-490004614784/manual-deploy/
aws s3 cp subdomain-proxy.js s3://elasticbeanstalk-ap-northeast-2-490004614784/manual-deploy/

# EC2 인스턴스에서 실행할 스크립트 생성
cat > restart-script.sh << 'SCRIPT'
#!/bin/bash
set -e

echo "📥 Downloading latest files..."
cd /tmp
aws s3 cp s3://elasticbeanstalk-ap-northeast-2-490004614784/manual-deploy/subdomain-server.js ./
aws s3 cp s3://elasticbeanstalk-ap-northeast-2-490004614784/manual-deploy/subdomain-proxy.js ./

echo "🔄 Stopping existing server..."
sudo pkill -f "node.*subdomain-server.js" || true
sleep 2

echo "📁 Setting up application directory..."
sudo mkdir -p /opt/pagecube-subdomain
sudo chown -R $USER:$USER /opt/pagecube-subdomain

# Copy files
cp subdomain-server.js /opt/pagecube-subdomain/
cp subdomain-proxy.js /opt/pagecube-subdomain/
cd /opt/pagecube-subdomain

# Create package.json if not exists
if [ ! -f package.json ]; then
cat > package.json << 'PKG'
{
  "name": "pagecube-subdomain-server",
  "version": "1.0.0",
  "main": "subdomain-server.js",
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "mysql2": "^3.6.0"
  }
}
PKG
fi

# Install dependencies
npm install --production

# Create deployed-sites directory
mkdir -p deployed-sites

echo "🚀 Starting server..."
nohup node subdomain-server.js > /var/log/subdomain-server.log 2>&1 &

sleep 3

# Test server
if curl -f http://localhost:3001 >/dev/null 2>&1; then
  echo "✅ Server is running on port 3001"
  echo "📋 Process: $(pgrep -f subdomain-server.js)"
else
  echo "❌ Server failed to start, check logs: tail -f /var/log/subdomain-server.log"
fi
SCRIPT

# S3에 재시작 스크립트 업로드
aws s3 cp restart-script.sh s3://elasticbeanstalk-ap-northeast-2-490004614784/restart-script.sh

echo "✅ Files uploaded to S3"
echo "📋 Now run this on EC2 instance:"
echo "aws s3 cp s3://elasticbeanstalk-ap-northeast-2-490004614784/restart-script.sh ./"
echo "chmod +x restart-script.sh"
echo "./restart-script.sh"

rm restart-script.sh
