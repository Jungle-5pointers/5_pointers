#!/bin/bash

echo "🔧 서브도메인 서버 배포 수정 스크립트"

# 1. 서브도메인 서버를 Docker 컨테이너로 배포하도록 deployment-script.sh 수정
cat >> deployment-script.sh << 'SUBDOMAIN_FIX'

# 서브도메인 서버 추가
echo "🌐 서브도메인 서버 설정..."

# 서브도메인 서버용 Docker Compose 서비스 추가
cat >> docker-compose.simple.yml << 'SUBDOMAIN_EOF'

  # 서브도메인 서버
  subdomain-server:
    image: node:18-alpine
    ports:
      - "3001:3001"
    working_dir: /app
    volumes:
      - ./:/app
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DB_HOST=${DB_HOST:-jungle-db5-instance-1.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com}
      - DB_PORT=${DB_PORT:-3306}
      - DB_USERNAME=${DB_USERNAME:-admin}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=${DB_DATABASE:-fivepointers}
      - API_BASE_URL=${API_BASE_URL:-https://jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com/api}
    command: >
      sh -c "
        npm install &&
        node subdomain-server.js
      "
    restart: unless-stopped

SUBDOMAIN_EOF

SUBDOMAIN_FIX

echo "✅ 서브도메인 배포 스크립트 수정 완료"

# 2. Nginx 설정으로 서브도메인 라우팅 추가
cat > nginx-subdomain.conf << 'NGINX_CONF'
server {
    listen 80;
    server_name ~^(?<subdomain>.+)\.pagecube\.net$;
    
    location / {
        proxy_pass http://subdomain-server:3001/$subdomain;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80 default_server;
    server_name _;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_CONF

echo "✅ Nginx 서브도메인 설정 생성 완료"
echo ""
echo "📋 다음 단계:"
echo "1. 이 스크립트를 실행하여 배포 스크립트 수정"
echo "2. DNS에서 *.pagecube.net을 서버 IP로 설정"
echo "3. 수정된 배포 스크립트로 재배포"
