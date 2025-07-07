# 소셜 로그인 설정 가이드

## 개요
구글과 카카오 소셜 로그인을 설정하는 방법을 안내합니다.

## 1. Google OAuth 설정

### 1.1 Google Cloud Console에서 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보"로 이동

### 1.2 OAuth 2.0 클라이언트 ID 생성
1. "사용자 인증 정보 만들기" > "OAuth 2.0 클라이언트 ID" 선택
2. 애플리케이션 유형: "웹 애플리케이션" 선택
3. 승인된 리디렉션 URI 추가:
   - 개발 환경: `http://localhost:5173/google`
   - 프로덕션 환경: `https://yourdomain.com/google`

### 1.3 환경 변수 설정
백엔드 `.env` 파일에 다음 설정 추가:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5173/google
```

프론트엔드 `.env` 파일에 다음 설정 추가:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## 2. Kakao OAuth 설정

### 2.1 Kakao Developers에서 애플리케이션 생성
1. [Kakao Developers](https://developers.kakao.com/)에 접속
2. "내 애플리케이션" > "애플리케이션 추가하기"
3. 앱 이름과 회사명 입력

### 2.2 플랫폼 설정
1. "플랫폼" > "Web" 플랫폼 추가
2. 사이트 도메인 설정:
   - 개발 환경: `http://localhost:5173`
   - 프로덕션 환경: `https://yourdomain.com`

### 2.3 카카오 로그인 설정
1. "카카오 로그인" > "활성화"
2. "Redirect URI" 설정:
   - 개발 환경: `http://localhost:5173/kakao`
   - 프로덕션 환경: `https://yourdomain.com/kakao`
3. "동의항목" 설정:
   - 필수: 닉네임, 이메일
   - 선택: 프로필 사진

### 2.4 환경 변수 설정
백엔드 `.env` 파일에 다음 설정 추가:
```env
KAKAO_CLIENT_ID=your_kakao_client_id_here
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
KAKAO_CALLBACK_URL=http://localhost:5173/kakao
```

프론트엔드 `.env` 파일에 다음 설정 추가:
```env
VITE_KAKAO_CLIENT_ID=your_kakao_client_id_here
```

## 3. 환경 변수 파일 생성

### 3.1 백엔드 환경 변수
```bash
# backend/.env 파일 생성
cp backend/env.example backend/.env
# .env 파일을 편집하여 실제 값으로 변경
```

### 3.2 프론트엔드 환경 변수
```bash
# my-web-builder/apps/frontend/.env 파일 생성
cp my-web-builder/apps/frontend/env.example my-web-builder/apps/frontend/.env
# .env 파일을 편집하여 실제 값으로 변경
```

## 4. 서버 재시작
환경 변수를 설정한 후 서버를 재시작해야 합니다:

```bash
# 백엔드 재시작
cd backend
npm run start:dev

# 프론트엔드 재시작
cd my-web-builder/apps/frontend
npm run dev
```

## 5. 문제 해결

### 5.1 일반적인 오류
- **"OAuth 설정이 완료되지 않았습니다"**: 환경 변수가 제대로 설정되지 않음
- **"리디렉션 URI가 일치하지 않습니다"**: OAuth 콘솔의 리디렉션 URI와 실제 URL이 다름
- **"이메일 정보를 가져올 수 없습니다"**: 카카오 로그인에서 이메일 제공 동의가 필요함

### 5.2 디버깅
1. 브라우저 개발자 도구에서 네트워크 탭 확인
2. 백엔드 로그에서 상세한 오류 메시지 확인
3. 환경 변수가 제대로 로드되었는지 확인

### 5.3 로컬 개발 시 주의사항
- HTTPS가 아닌 HTTP를 사용하는 경우 일부 브라우저에서 제한될 수 있음
- localhost 대신 127.0.0.1을 사용해보세요
- 브라우저의 쿠키 및 캐시를 삭제해보세요

## 6. 프로덕션 배포 시 주의사항
- 모든 URL을 HTTPS로 변경
- 실제 도메인으로 리디렉션 URI 업데이트
- 환경 변수를 서버 환경에 맞게 설정
- 보안을 위해 JWT_SECRET을 강력한 랜덤 문자열로 설정 