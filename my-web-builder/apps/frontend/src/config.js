
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

// 프로덕션 환경 감지 함수 (API_BASE_URL 설정 전에 정의)
const isProductionEnvironment = () => {
  // 1. 명시적 환경변수 확인
  const viteMode = getEnvVar('VITE_MODE');
  const nodeEnv = getEnvVar('NODE_ENV');
  
  // 2. URL 기반 감지 (브라우저에서 가장 확실한 방법)
  const currentUrl = typeof window !== 'undefined' ? window.location.hostname : '';
  const isS3Domain = currentUrl.includes('s3-website') || currentUrl.includes('amazonaws.com');
  const isDdukddakDomain = currentUrl.includes('ddukddak.org');
  const isCloudFrontDomain = currentUrl.includes('cloudfront.net');
  
  console.log('🔍 환경 감지:', {
    viteMode,
    nodeEnv,
    currentUrl,
    isS3Domain,
    isDdukddakDomain,
    isCloudFrontDomain
  });
  
  return viteMode === 'production' || nodeEnv === 'production' || isS3Domain || isDdukddakDomain || isCloudFrontDomain;
};

// 로컬 네트워크 IP 주소 감지 함수
const getLocalNetworkIP = () => {
  try {
    // 브라우저에서 현재 페이지의 호스트명을 사용
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // localhost인 경우 localhost 사용 (로컬 협업을 위해)
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'localhost';
      }
      
      // 실제 IP 주소인 경우 그대로 사용
      return hostname;
    }
  } catch (error) {
    console.warn('로컬 네트워크 IP 감지 실패:', error);
  }
  return 'localhost'; // 기본값을 localhost로 변경
};

// API 서버 설정 - 환경변수 기반
export const API_BASE_URL = getEnvVar('VITE_API_URL') || getEnvVar('VITE_API_BASE_URL') || getEnvVar('NEXT_PUBLIC_API_URL') || 
  (isProductionEnvironment() ? 'https://ddukddak.org/' : 'http://localhost:3000/');

// Y.js WebSocket 서버 설정 - 환경변수 기반
export const YJS_WEBSOCKET_URL = getEnvVar('VITE_YJS_WEBSOCKET_URL') || getEnvVar('VITE_WEBSOCKET_URL') || getEnvVar('NEXT_PUBLIC_YJS_WEBSOCKET_URL') ||
  (isProductionEnvironment() ? 'wss://3.35.50.227:1235' : `ws://${getLocalNetworkIP()}:1234`);

// 소셜 로그인 설정
export const GOOGLE_CLIENT_ID = getEnvVar('VITE_GOOGLE_CLIENT_ID') || getEnvVar('NEXT_PUBLIC_GOOGLE_CLIENT_ID') || '';
export const KAKAO_CLIENT_ID = getEnvVar('VITE_KAKAO_CLIENT_ID') || getEnvVar('NEXT_PUBLIC_KAKAO_CLIENT_ID') || '';

// 리다이렉트 URL - 환경변수 기반
export const getRedirectUrl = (provider) => {
  const frontendUrl = getEnvVar('VITE_FRONTEND_URL') || getEnvVar('NEXT_PUBLIC_FRONTEND_URL') || 
    (isProductionEnvironment() ? 'https://ddukddak.org' : 'http://localhost:5173');
  return `${frontendUrl}/social-callback?provider=${provider}`;
};

// 배포 URL 생성 함수 (API 엔드포인트 기반으로 변경)
export const getDeployedUrl = (subdomain) => {
  const isProduction = isProductionEnvironment();
  
  console.log('🚀 getDeployedUrl 호출:', {
    subdomain,
    isProduction,
    currentHostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
  });
  
  if (isProduction) {
    // 프로덕션: CloudFront 우회하여 백엔드 API 직접 접근
    const url = `https://ddukddak.org/api/generator/deployed-sites/${subdomain}`;
    console.log('✅ 프로덕션 URL 생성 (API 엔드포인트 기반):', url);
    return url;
  } else {
    // 로컬: 와일드카드 서브도메인 서버 사용
    const url = `http://${subdomain}.localhost:3001`;
    console.log('🏠 로컬 URL 생성 (와일드카드 서브도메인):', url);
    return url;
  }
};

console.log('🔧 API 설정:', {
  baseUrl: API_BASE_URL,
  websocketUrl: YJS_WEBSOCKET_URL,
  frontend: getEnvVar('VITE_FRONTEND_URL') || getEnvVar('NEXT_PUBLIC_FRONTEND_URL') || 'http://localhost:5173'
}); 