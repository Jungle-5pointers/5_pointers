import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  // 소셜 로그인 리다이렉트 URL
  const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:5173/google&response_type=code&scope=openid%20email%20profile`;
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}&redirect_uri=http://localhost:5173/kakao&response_type=code`;

  // 소셜 로그인 인가 코드 처리
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (code) {
      const isGoogle = url.pathname.includes('google');
      const isKakao = url.pathname.includes('kakao');
      const provider = isGoogle ? 'google' : isKakao ? 'kakao' : undefined;
      if (provider) {
        fetch('http://localhost:3000/auth/login/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, authorizationCode: code }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.access_token) {
              localStorage.setItem('token', data.access_token);
              onLogin({ nickname: provider + 'User' });
              navigate('/dashboard');
              // URL에서 code 파라미터 제거
              window.history.replaceState({}, document.title, url.pathname);
            } else {
              setMsg(data.message || '소셜 로그인 실패');
            }
          })
          .catch(() => setMsg('소셜 로그인 에러'));
      }
    }
    // eslint-disable-next-line
  }, []);

  // 로컬 로그인
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await fetch('http://localhost:3000/auth/login/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        onLogin({ nickname: email.split('@')[0] });
        navigate('/dashboard');
      } else {
        setMsg(data.message || '로그인 실패');
      }
    } catch (err) {
      setMsg('로그인 에러');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center' }}>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        /><br />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        /><br />
        <button type="submit" style={{ width: '100%' }}>로그인</button>
      </form>
      <div style={{ margin: '16px 0' }}>
        <a href={GOOGLE_AUTH_URL}>
          <button style={{ width: '48%', marginRight: '4%' }}>구글 로그인</button>
        </a>
        <a href={KAKAO_AUTH_URL}>
          <button style={{ width: '48%' }}>카카오 로그인</button>
        </a>
      </div>
      {msg && <div style={{ color: 'red' }}>{msg}</div>}
      <div style={{ marginTop: 16 }}>
        <Link to="/signup">회원가입</Link>
      </div>
    </div>
  );
}

export default LoginPage;