import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import PropertyEditorTest from './pages/PropertyEditorTest';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ nickname: 'User' });

  // 로그인 성공 시 호출
  const handleLogin = (userInfo) => {
    setIsLoggedIn(true);
    setUser(userInfo);
  };

  // 로그아웃
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route
          path="/login"
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/signup"
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignupPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? <DashboardPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/editor/:pageId"
          element={
            isLoggedIn ? <EditorPage /> : <Navigate to="/login" replace />
          }
        />
        {/* 속성 에디터 테스트 페이지 */}
        <Route path="/test/property-editor" element={<PropertyEditorTest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
