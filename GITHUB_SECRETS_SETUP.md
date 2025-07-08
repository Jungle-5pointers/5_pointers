# 🔐 GitHub Secrets 설정 가이드

GitHub Actions에서 사용할 환경 변수들을 GitHub Secrets에 설정해야 합니다.

## 📋 설정해야 할 Secrets

### AWS 관련
```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_SESSION_TOKEN=your-aws-session-token (필요한 경우)
```

### 프론트엔드 환경 변수
```
VITE_API_URL_PRODUCTION=http://Jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com
VITE_WEBSOCKET_URL_PRODUCTION=ws://your-yjs-server-url:3003
```

### 백엔드 환경 변수 (GitHub Secrets에 설정 필요)
```
DB_HOST=jungle-db5-instance-1.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=Jungle5pointers2025!
DB_DATABASE=fivepointers
JWT_SECRET=jungle-5pointers-super-secret-key-2025
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
KAKAO_REST_API_KEY=your-kakao-rest-api-key
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_JAVASCRIPT_KEY=your-kakao-javascript-key
```

## 🔧 GitHub Secrets 설정 방법

1. GitHub 저장소로 이동
2. Settings > Secrets and variables > Actions
3. "New repository secret" 클릭
4. 위의 값들을 하나씩 추가

## ⚠️ 보안 주의사항

- 실제 프로덕션 환경에서는 더 강력한 비밀번호와 시크릿 키 사용
- AWS 액세스 키는 최소 권한 원칙 적용
- 정기적으로 시크릿 키 교체
