import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function SocialCallbackPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const isGoogle = url.pathname.includes('google');
    const isKakao = url.pathname.includes('kakao');
    const provider = isGoogle ? 'google' : isKakao ? 'kakao' : undefined;

    console.log('SocialCallbackPage - provider:', provider, 'code:', code);

    if (code && provider) {
      fetch(`${API_BASE_URL}/auth/login/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, authorizationCode: code }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('SocialCallbackPage - 백엔드 응답:', data);
          console.log('SocialCallbackPage - 응답의 모든 키:', Object.keys(data));
          console.log('SocialCallbackPage - data.user:', data.user);
          console.log('SocialCallbackPage - data.nickname:', data.nickname);
          console.log('SocialCallbackPage - data.name:', data.name);
          console.log('SocialCallbackPage - 전체 응답 구조:', JSON.stringify(data, null, 2));
          
          window.history.replaceState({}, document.title, url.pathname);
          if (data.access_token) {
            localStorage.setItem('token', data.access_token);
            
            // JWT 토큰에서 사용자 정보 추출
            let nickname = `${provider}User`; // 기본값
            
            try {
              // JWT 토큰 디코딩 (payload 부분만 추출) - 한글 깨짐 방지
              const tokenParts = data.access_token.split('.');
              if (tokenParts.length === 3) {
                // Base64 디코딩 후 UTF-8로 디코딩
                const base64Payload = tokenParts[1];
                const decodedPayload = decodeURIComponent(
                  atob(base64Payload)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(decodedPayload);
                console.log('JWT payload (한글 처리됨):', payload);
                
                nickname = payload.nickname || payload.name || payload.email?.split('@')[0] || nickname;
              }
            } catch (error) {
              console.error('JWT 디코딩 실패:', error);
              // 실패 시 기본값 사용
            }
            
            console.log('SocialCallbackPage - 최종 사용할 nickname:', nickname);
            onLogin({ nickname });
            
            // 초대 링크에서 왔는지 확인하고 리디렉션
            const redirectUrl = localStorage.getItem('redirectUrl');
            if (redirectUrl) {
              // 리디렉션 URL 정리
              localStorage.removeItem('redirectUrl');
              console.log('소셜 로그인 후 원래 목적지로 이동:', redirectUrl);
              // 전체 URL로 이동 (초대 링크 처리를 위해)
              window.location.href = redirectUrl;
            } else {
              // 기본 대시보드로 이동
              navigate('/dashboard');
            }
          } else {
            alert(data.message || '소셜 로그인 실패');
            navigate('/login');
          }
        })
        .catch(error => {
          console.error('SocialCallbackPage - 에러:', error);
          window.history.replaceState({}, document.title, url.pathname);
          alert('소셜 로그인 에러');
          navigate('/login');
        });
    } else {
      navigate('/');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-blue-200/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">소셜 로그인 처리 중...</p>
        </div>
      </div>
    </div>
  );
}

export default SocialCallbackPage;
