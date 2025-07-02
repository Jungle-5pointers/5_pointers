// API 서버 설정 - 항상 localhost 사용
export const API_BASE_URL = 'http://localhost:3000';

// 소셜 로그인 설정
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID || '';

// 리다이렉트 URL - 항상 localhost 사용
export const getRedirectUrl = (provider) => {
  return `http://localhost:5173/${provider}`;
};

console.log('🔧 API 설정:', {
  baseUrl: API_BASE_URL,
  frontend: 'http://localhost:5173'
}); 