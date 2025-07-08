#!/bin/bash

echo "🚀 빠른 서브도메인 서버 시작..."

# User Data로 서버 시작 스크립트 생성
USER_DATA_SCRIPT='#!/bin/bash
cd /home/ec2-user

# Node.js 설치 확인
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 서브도메인 서버 파일 다운로드
aws s3 cp s3://elasticbeanstalk-ap-northeast-2-490004614784/manual-deploy/subdomain-server.js ./

# 기존 프로세스 종료
sudo pkill -f "node.*subdomain-server.js" || true

# 서버 시작
nohup node subdomain-server.js > /var/log/subdomain-server.log 2>&1 &

echo "Server started at $(date)" >> /var/log/startup.log
'

# Base64 인코딩
USER_DATA_B64=$(echo "$USER_DATA_SCRIPT" | base64 -w 0)

# 인스턴스 중지
echo "🔄 인스턴스 중지 중..."
aws ec2 stop-instances --instance-ids i-04fbc4dabb196621f --region ap-northeast-2 >/dev/null

# 중지 대기
echo "⏳ 중지 대기 중..."
aws ec2 wait instance-stopped --instance-ids i-04fbc4dabb196621f --region ap-northeast-2

# User Data 설정
echo "⚙️ User Data 설정 중..."
aws ec2 modify-instance-attribute \
  --instance-id i-04fbc4dabb196621f \
  --user-data "$USER_DATA_B64" \
  --region ap-northeast-2

# 인스턴스 시작
echo "🚀 인스턴스 시작 중..."
aws ec2 start-instances --instance-ids i-04fbc4dabb196621f --region ap-northeast-2 >/dev/null

# 시작 대기
echo "⏳ 시작 대기 중..."
aws ec2 wait instance-running --instance-ids i-04fbc4dabb196621f --region ap-northeast-2

echo "✅ 인스턴스 재시작 완료!"
echo "⏳ 서버 시작까지 1-2분 대기 필요"
