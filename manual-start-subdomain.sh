#!/bin/bash
set -e

echo "🚀 서브도메인 서버 수동 실행 시작..."

# 1. 최신 파일들을 S3에 업로드
echo "📤 최신 파일 S3 업로드..."
aws s3 cp subdomain-server.js s3://elasticbeanstalk-ap-northeast-2-490004614784/manual/
aws s3 cp subdomain-proxy.js s3://elasticbeanstalk-ap-northeast-2-490004614784/manual/

# 2. 실행 스크립트 생성
cat > start-server.sh << 'START'
#!/bin/bash
set -e

echo "🔧 서브도메인 서버 설정 중..."

# 파일 다운로드
cd /tmp
echo "📥 파일 다운로드 중..."
aws s3 cp s3://elasticbeanstalk-ap-northeast-2-490004614784/manual/subdomain-server.js ./
aws s3 cp s3://elasticbeanstalk-ap-northeast-2-490004614784/manual/subdomain-proxy.js ./

# 기존 프로세스 종료
echo "🔄 기존 프로세스 종료..."
sudo pkill -f "node.*subdomain-server" || true
sudo pkill -f "subdomain-server.js" || true
sleep 3

# 앱 디렉토리 설정
echo "📁 앱 디렉토리 설정..."
sudo mkdir -p /opt/pagecube-subdomain
sudo chown -R ec2-user:ec2-user /opt/pagecube-subdomain

# 파일 복사
cp subdomain-server.js /opt/pagecube-subdomain/
cp subdomain-proxy.js /opt/pagecube-subdomain/
cd /opt/pagecube-subdomain

# package.json 생성
echo "📦 package.json 생성..."
cat > package.json << 'PKG'
{
  "name": "pagecube-subdomain-server",
  "version": "1.0.0",
  "main": "subdomain-server.js",
  "scripts": {
    "start": "node subdomain-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "mysql2": "^3.6.0"
  }
}
PKG

# Node.js 20 설치 확인
echo "🔍 Node.js 버전 확인..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]; then
  echo "📦 Node.js 20 설치 중..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "✅ Node.js 버전: $(node -v)"

# 의존성 설치
echo "📦 의존성 설치 중..."
npm install --production

# deployed-sites 디렉토리 생성
mkdir -p deployed-sites

# 환경변수 설정
export NODE_ENV=production
export PORT=3001
export API_BASE_URL="https://jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com/api"

# 서버 시작
echo "🚀 서버 시작 중..."
nohup node subdomain-server.js > /var/log/subdomain-server.log 2>&1 &
SERVER_PID=$!

echo "✅ 서버 시작됨! PID: $SERVER_PID"
sleep 5

# 서버 상태 확인
if ps -p $SERVER_PID > /dev/null; then
  echo "✅ 서버 프로세스 실행 중"
else
  echo "❌ 서버 프로세스 실행 실패"
  echo "📋 로그 확인: tail -f /var/log/subdomain-server.log"
  exit 1
fi

# 포트 테스트
echo "🔍 포트 3001 테스트..."
sleep 3
if curl -f http://localhost:3001 >/dev/null 2>&1; then
  echo "✅ 서버가 포트 3001에서 응답 중"
else
  echo "⚠️ 서버 응답 없음, 로그 확인 필요"
  echo "📋 로그: tail -f /var/log/subdomain-server.log"
fi

echo "🎉 서브도메인 서버 수동 실행 완료!"
echo "📋 프로세스 확인: ps aux | grep subdomain-server"
echo "📋 로그 확인: tail -f /var/log/subdomain-server.log"
START

# 3. S3에 실행 스크립트 업로드
echo "📤 실행 스크립트 S3 업로드..."
aws s3 cp start-server.sh s3://elasticbeanstalk-ap-northeast-2-490004614784/start-server.sh

echo "✅ 파일 업로드 완료!"
rm start-server.sh
