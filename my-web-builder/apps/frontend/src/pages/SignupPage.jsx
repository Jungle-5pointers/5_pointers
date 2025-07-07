import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function SignupPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

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

  // 닉네임 유효성 검사
  const validateNickname = (nickname) => {
    if (!nickname) {
      setNicknameError('닉네임을 입력해주세요.');
      return false;
    } else if (nickname.length < 2) {
      setNicknameError('닉네임은 최소 2자 이상이어야 합니다.');
      return false;
    } else if (nickname.length > 20) {
      setNicknameError('닉네임은 최대 20자까지 가능합니다.');
      return false;
    } else {
      setNicknameError('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    
    // 유효성 검사
    const isEmailValid = validateEmail(email);
    const isNicknameValid = validateNickname(nickname);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isNicknameValid || !isPasswordValid) {
      return;
    }
    
    setIsLoading(true);
    
    if (email && nickname && password) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/signup/local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, nickname, password }),
        });
        const data = await res.json();
        
        if (res.ok) {
          // 회원가입 성공 후 자동 로그인
          try {
            const loginRes = await fetch(`${API_BASE_URL}/auth/login/local`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });
            const loginData = await loginRes.json();
            
            if (loginRes.ok && loginData.access_token) {
              localStorage.setItem('token', loginData.access_token);
              onLogin({ nickname });
              
              // 초대 링크에서 왔는지 확인하고 리디렉션
              const redirectUrl = localStorage.getItem('redirectUrl');
              if (redirectUrl) {
                localStorage.removeItem('redirectUrl');
                console.log('회원가입 후 원래 목적지로 이동:', redirectUrl);
                window.location.href = redirectUrl;
              } else {
                navigate('/dashboard');
              }
            } else {
              // 자동 로그인 실패 시 일반 회원가입 완료 처리
              onLogin({ nickname });
              navigate('/dashboard');
            }
          } catch (loginErr) {
            console.error('자동 로그인 실패:', loginErr);
            // 자동 로그인 실패 시 일반 회원가입 완료 처리
            onLogin({ nickname });
            navigate('/dashboard');
          }
        } else {
          // 서버에서 보낸 오류 메시지가 있으면 사용, 없으면 기본 메시지
          if (data.message) {
            setMsg(data.message);
          } else if (res.status === 400) {
            setMsg('입력 정보를 확인해주세요.');
          } else if (res.status === 409) {
            setMsg('이미 존재하는 이메일입니다.');
          } else {
            setMsg('회원가입에 실패했습니다. 다시 시도해주세요.');
          }
        }
      } catch (err) {
        console.error('회원가입 오류:', err);
        setMsg('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setMsg('모든 항목을 입력하세요.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-blue-200/30">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            회원가입
          </h2>
          <p className="text-slate-600 text-lg font-medium leading-relaxed">
            새로운 여정을<br/>
            <span className="text-blue-600 font-semibold">함께</span> 시작해보세요
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => {
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
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={e => {
                setNickname(e.target.value);
                if (nicknameError) validateNickname(e.target.value);
              }}
              onBlur={(e) => validateNickname(e.target.value)}
              className={`w-full px-5 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-slate-400 font-medium ${
                nicknameError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
              }`}
              required
              disabled={isLoading}
            />
            {nicknameError && (
              <p className="mt-1 text-red-500 text-sm">{nicknameError}</p>
            )}
          </div>
          
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => {
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
                가입 중...
              </div>
            ) : (
              '가입하기'
            )}
          </button>
        </form>
        
        {msg && (
          <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
            <div className="flex items-center justify-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-600 text-sm text-center font-medium">{msg}</p>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-slate-600 leading-relaxed">
            이미 계정이 있으신가요?{' '}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-indigo-600 font-semibold hover:underline transition-all duration-300"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;