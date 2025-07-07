
// 환경변수 접근 방식 통합 (Vite + Next.js 호환)
const getEnvVar = (key, defaultValue = '') => {
  try {
    // Vite 환경 (import.meta.env)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || defaultValue;
    }
    // Next.js 환경 (process.env)
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
  } catch (error) {
    console.warn('환경변수 접근 오류:', error);
  }
  return defaultValue;
};

// API 서버 설정 - 환경변수 기반
export const API_BASE_URL = getEnvVar('VITE_API_URL') || getEnvVar('NEXT_PUBLIC_API_URL') || 
  (getEnvVar('NODE_ENV') === 'production' ? 'https://jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com' : 'http://localhost:3000');

// Y.js WebSocket 서버 설정 - 환경변수 기반
export const YJS_WEBSOCKET_URL = getEnvVar('VITE_YJS_WEBSOCKET_URL') || getEnvVar('NEXT_PUBLIC_YJS_WEBSOCKET_URL') || 
  (getEnvVar('NODE_ENV') === 'production' ? 'wss://demos.yjs.dev' : 'ws://localhost:1234');

// 소셜 로그인 설정
export const GOOGLE_CLIENT_ID = getEnvVar('VITE_GOOGLE_CLIENT_ID') || getEnvVar('NEXT_PUBLIC_GOOGLE_CLIENT_ID') || '';
export const KAKAO_CLIENT_ID = getEnvVar('VITE_KAKAO_CLIENT_ID') || getEnvVar('NEXT_PUBLIC_KAKAO_CLIENT_ID') || '';

// 리다이렉트 URL - 환경변수 기반
export const getRedirectUrl = (provider) => {
  const frontendUrl = getEnvVar('VITE_FRONTEND_URL') || getEnvVar('NEXT_PUBLIC_FRONTEND_URL') || 'http://localhost:5173';
  return `${frontendUrl}/${provider}`;
};

// 프로덕션 환경 감지 (여러 방법 사용)
const isProductionEnvironment = () => {
  // 1. 명시적 환경변수 확인
  const viteMode = getEnvVar('VITE_MODE');
  const nodeEnv = getEnvVar('NODE_ENV');
  
  // 2. URL 기반 감지 (브라우저에서 가장 확실한 방법)
  const currentUrl = typeof window !== 'undefined' ? window.location.hostname : '';
  const isS3Domain = currentUrl.includes('s3-website') || currentUrl.includes('amazonaws.com');
  
  // 3. API URL 기반 감지
  const isProductionAPI = API_BASE_URL.includes('elasticbeanstalk') || API_BASE_URL.includes('amazonaws.com');
  
  console.log('🔍 환경 감지:', {
    viteMode,
    nodeEnv,
    currentUrl,
    isS3Domain,
    isProductionAPI,
    apiBaseUrl: API_BASE_URL
  });
  
  return viteMode === 'production' || nodeEnv === 'production' || isS3Domain || isProductionAPI;
};

// 서브도메인 배포 URL 생성 함수 (서브도메인 기반)
export const getDeployedUrl = (subdomain) => {
  const isProduction = isProductionEnvironment();
  
  if (isProduction) {
    // 프로덕션: pagecube.net 서브도메인 사용
    return `https://${subdomain}.pagecube.net`;
  } else {
    // 로컬: 별도 포트의 서브도메인 서버 사용
    return `http://localhost:3001/${subdomain}`;
  }
};

console.log('🔧 API 설정:', {
  baseUrl: API_BASE_URL,
  websocketUrl: YJS_WEBSOCKET_URL,
  frontend: getEnvVar('VITE_FRONTEND_URL') || getEnvVar('NEXT_PUBLIC_FRONTEND_URL') || 'http://localhost:5173'
}); 