import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import SocialCallbackPage from './pages/SocialCallbackPage';
import Dashboard from "./pages/Dashboard";
import AppEditor from "./pages/AppEditor";
import NoCodeEditor from './pages/NoCodeEditor';
import InvitationHandler from './pages/InvitationHandler';

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
          path="/editor"
          element={
            isLoggedIn ? <AppEditor /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/google"
          element={<SocialCallbackPage onLogin={handleLogin} />}
        />
        <Route
          path="/kakao"
          element={<SocialCallbackPage onLogin={handleLogin} />}
        />
        <Route path="/editor/:roomId" element={<NoCodeEditor />} />
        <Route path="/invite/:invitationToken" element={<InvitationHandler />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;