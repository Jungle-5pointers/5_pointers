#!/bin/bash

# EC2 배포 스크립트
# 빌드된 서브도메인 서버를 EC2에 배포합니다.

echo "🚀 EC2 배포 시작..."

# 설정
EC2_IP="3.35.50.227"  # EC2 IP 주소
KEY_PATH="../../../infrastructure/5pointers-key-new.pem"  # SSH 키 경로
REMOTE_DIR="/home/ec2-user/subdomain-server"  # 원격 서버 디렉토리
LOCAL_DIR="/home/yjlee/5_pointers/my-web-builder/apps/subdomain-nextjs"

# 1. 배포 준비 (로컬에서 빌드)
echo "📦 로컬 빌드 중..."
cd $LOCAL_DIR
./deploy-prepare.sh

# 2. 원격 서버에 디렉토리 생성
echo "📁 원격 서버 디렉토리 생성..."
ssh -i $KEY_PATH ec2-user@$EC2_IP "mkdir -p $REMOTE_DIR"

# 3. 파일 업로드
echo "📤 파일 업로드 중..."
rsync -avz -e "ssh -i $KEY_PATH" \
  --exclude node_modules \
  --exclude .git \
  --exclude .next \
  $LOCAL_DIR/ ec2-user@$EC2_IP:$REMOTE_DIR/

# 4. 원격 서버에서 설치 및 실행
echo "🔧 원격 서버 설정 중..."
ssh -i $KEY_PATH ec2-user@$EC2_IP << 'EOF'
cd /home/ec2-user/subdomain-server

# Node.js 설치 (필요한 경우)
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi

# 의존성 설치
npm install

# 빌드
npm run build

# 기존 서버 중지
sudo pkill -f "next start" || true

# 새 서버 시작
nohup npm start > subdomain-server.log 2>&1 &

echo "✅ 서브도메인 서버가 시작되었습니다!"
echo "📝 로그 확인: tail -f subdomain-server.log"
EOF

echo "🎉 EC2 배포 완료!"
echo "🌐 서브도메인 서버 URL: http://$EC2_IP:3000"
echo "📊 서버 상태 확인: ssh -i $KEY_PATH ec2-user@$EC2_IP 'ps aux | grep next'"
