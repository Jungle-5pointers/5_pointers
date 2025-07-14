import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import DraftsPage from './pages/DraftsPage';
import DeployedPage from './pages/DeployedPage';
import SocialCallbackPage from './pages/SocialCallbackPage';
import Dashboard from './pages/Dashboard';
import AppEditor from './pages/AppEditor';
import NoCodeEditor from './pages/NoCodeEditor';
import InvitationHandler from './pages/InvitationHandler';
import RecoveryTest from './pages/RecoveryTest';

function App() {
  // JWT 토큰 기반으로 로그인 상태 확인
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    console.log('App.jsx - 토큰 확인:', token ? '존재함' : '없음');

    if (!token) {
      console.log('App.jsx - 토큰이 없음, 로그인 안됨');
      return false;
    }

    try {
      // JWT 토큰 구조 확인
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error(
          'App.jsx - JWT 토큰 구조가 올바르지 않음:',
          tokenParts.length,
          'parts'
        );
        return false;
      }

      // Base64URL을 Base64로 변환
      let base64 = tokenParts[1];
      base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

      // 패딩 추가
      while (base64.length % 4) {
        base64 += '=';
      }

      // UTF-8로 안전하게 디코딩
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const utf8String = new TextDecoder('utf-8').decode(bytes);
      const payload = JSON.parse(utf8String);

      const currentTime = Date.now() / 1000;
      const isValid = payload.exp > currentTime;

      console.log('App.jsx - JWT 검증:', {
        exp: payload.exp,
        currentTime,
        isValid,
        payload: payload,
      });

      return isValid;
    } catch (error) {
      console.error('App.jsx - JWT 파싱 오류:', error);
      console.error('App.jsx - 문제가 있는 토큰:', token);
      return false;
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(checkLoginStatus);
  const [user, setUser] = useState(() => {
    // 로그인 상태에 따라 사용자 정보 설정
    const token = localStorage.getItem('token');
    if (!token) return { nickname: 'Guest' };

    try {
      // JWT 토큰 구조 확인
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return { nickname: 'Guest' };
      }

      // Base64URL을 Base64로 변환
      let base64 = tokenParts[1];
      base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

      // 패딩 추가
      while (base64.length % 4) {
        base64 += '=';
      }

      // UTF-8로 안전하게 디코딩
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const utf8String = new TextDecoder('utf-8').decode(bytes);
      const payload = JSON.parse(utf8String);

      return {
        nickname:
          payload.nickname ||
          payload.name ||
          payload.email?.split('@')[0] ||
          'User',
      };
    } catch (error) {
      console.error('App.jsx - 사용자 정보 파싱 오류:', error);
      return { nickname: 'Guest' };
    }
  });

  // 로그인 성공 시 호출
  const handleLogin = (userInfo) => {
    setIsLoggedIn(true);
    setUser(userInfo);

    // 초대 링크에서 왔는지 확인하고 리디렉션
    const redirectUrl = localStorage.getItem('redirectUrl');
    if (redirectUrl) {
      // 리디렉션 URL 정리
      localStorage.removeItem('redirectUrl');
      console.log('App.jsx: 로그인 후 원래 목적지로 이동:', redirectUrl);
      
      // URL 파라미터가 저장되어 있는지 확인
      const savedParams = localStorage.getItem('invitationParams');
      if (savedParams) {
        console.log('App.jsx: 저장된 파라미터 발견:', savedParams);
        // 파라미터는 InvitationHandler에서 처리하도록 그대로 두고
        // 초대 링크로 이동
        window.location.href = redirectUrl;
      } else {
        // 일반적인 리디렉션의 경우
        window.location.href = redirectUrl;
      }
    }
  };

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <MainPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignupPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <DashboardPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/drafts"
          element={
            isLoggedIn ? (
              <DraftsPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/deployed"
          element={
            isLoggedIn ? (
              <DeployedPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/editor/:pageId"
          element={
            isLoggedIn ? <AppEditor /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/social-callback"
          element={<SocialCallbackPage onLogin={handleLogin} />}
        />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/no-code-editor" element={<NoCodeEditor />} />
        <Route path="/invitation/:inviteCode" element={<InvitationHandler />} />
        <Route path="/recovery-test" element={<RecoveryTest />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
