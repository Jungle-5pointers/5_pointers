import React from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      maxWidth: 400,
      margin: '80px auto',
      padding: 32,
      border: '1px solid #eee',
      borderRadius: 12,
      textAlign: 'center',
      background: '#fafbfc'
    }}>
      <h1 style={{ marginBottom: 24 }}>PageLego: Create your website in minutes.</h1>
      <button
        style={{ width: '100%', marginBottom: 12, padding: 12, fontSize: 16 }}
        onClick={() => navigate('/login')}
      >
        Login
      </button>
      <button
        style={{ width: '100%', marginBottom: 12, padding: 12, fontSize: 16 }}
        onClick={() => navigate('/signup')}
      >
        Sign Up
      </button>
      <button
        style={{
          width: '100%',
          marginBottom: 12,
          padding: 12,
          fontSize: 16,
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 4
        }}
        onClick={() => navigate('/login')}
      >
        Get Started Now
      </button>
      
      {/* 테스트 페이지 링크 추가 */}
      <hr style={{ margin: '20px 0', border: '1px solid #ddd' }} />
      <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>개발 테스트</p>
      <button
        style={{
          width: '100%',
          padding: 12,
          fontSize: 14,
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: 4
        }}
        onClick={() => navigate('/test/property-editor')}
      >
        🧪 속성 에디터 테스트
      </button>
    </div>
  );
}

export default MainPage;
