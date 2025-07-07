import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  API_BASE_URL,
  GOOGLE_CLIENT_ID,
  KAKAO_CLIENT_ID,
  getRedirectUrl,
} from '../config';
import googleLoginImg from '../assets/web_light_sq_ctn@1x.png';
import kakaoLoginImg from '../assets/kakao_login_medium_narrow.png';
import pageCubeLogo from '../assets/page-cube-logo.png';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  // 소셜 로그인 리다이렉트 URL
  const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${getRedirectUrl('google')}&response_type=code&scope=openid%20email%20profile`;
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${getRedirectUrl('kakao')}&response_type=code`;

  // 이메일 유효성 검사
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('이메일을 입력해주세요.');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      return false;
    } else if (password.length < 6) {
      setPasswordError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  // 소셜 로그인은 SocialCallbackPage에서 처리됨

  // 로컬 로그인
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    
    // 유효성 검사
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        onLogin({ nickname: email.split('@')[0] });

        // App.jsx에서 리다이렉션을 처리하므로 여기서는 제거
        // 기본 대시보드로 이동 (리다이렉션이 없는 경우)
        if (!localStorage.getItem('redirectUrl')) {
          navigate('/dashboard');
        }
      } else {
        // 서버에서 보낸 오류 메시지가 있으면 사용, 없으면 기본 메시지
        if (data.message) {
          setMsg(data.message);
        } else if (res.status === 401) {
          setMsg('이메일 또는 비밀번호가 올바르지 않습니다.');
        } else if (res.status === 400) {
          setMsg('입력 정보를 확인해주세요.');
        } else if (res.status === 404) {
          setMsg('존재하지 않는 계정입니다.');
        } else {
          setMsg('로그인에 실패했습니다. 다시 시도해주세요.');
        }
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      setMsg('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-blue-200/30">
        {/* 로고 영역 - 네모 박스 위에 추가 */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <img
              src={pageCubeLogo}
              alt="Page Cube"
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            PAGE CUBE
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={(e) => validateEmail(e.target.value)}
              className={`w-full px-5 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-slate-400 font-medium ${
                emailError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
              }`}
              required
              disabled={isLoading}
            />
            {emailError && (
              <p className="mt-1 text-red-500 text-sm">{emailError}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
              }}
              onBlur={(e) => validatePassword(e.target.value)}
              className={`w-full px-5 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-slate-400 font-medium ${
                passwordError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
              }`}
              required
              disabled={isLoading}
            />
            {passwordError && (
              <p className="mt-1 text-red-500 text-sm">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border-0 mt-6 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                로그인 중...
              </div>
            ) : (
              '로그인하기'
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/90 text-slate-500 font-medium">
                또는
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <a href={GOOGLE_AUTH_URL} className="w-full">
              <img
                src={googleLoginImg}
                alt="구글 로그인"
                className="w-full h-12 object-contain cursor-pointer transition-all duration-300"
              />
            </a>

            <a href={KAKAO_AUTH_URL} className="w-full">
              <img
                src={kakaoLoginImg}
                alt="카카오 로그인"
                className="w-full h-12 object-contain cursor-pointer transition-all duration-300"
              />
            </a>
          </div>
        </div>

        {msg && (
          <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
            <div className="flex items-center justify-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-600 text-sm text-center font-medium">
                {msg}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-slate-600 leading-relaxed">
            계정이 없으신가요?{' '}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-indigo-600 font-semibold hover:underline transition-all duration-300"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
