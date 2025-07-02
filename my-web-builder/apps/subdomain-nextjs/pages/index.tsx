import { useEffect, useState } from 'react';

export default function Home() {
  const [host, setHost] = useState('');

  useEffect(() => {
    setHost(window.location.host);
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: '#f8f9fa'
    }}>
      <div style={{ textAlign: 'center', maxWidth: 600, padding: 40 }}>
        <h1 style={{ fontSize: 48, marginBottom: 16, color: '#333' }}>
          🌐 Subdomain Renderer
        </h1>
        <p style={{ fontSize: 18, color: '#666', marginBottom: 32 }}>
          Next.js 기반 동적 페이지 렌더링 서버
        </p>
        
        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: 24
        }}>
          <h3 style={{ marginBottom: 16, color: '#333' }}>사용법</h3>
          <p style={{ color: '#666', lineHeight: 1.6 }}>
            서브도메인으로 접근하세요:<br/>
            <code style={{
              background: '#f1f3f4',
              padding: '4px 8px',
              borderRadius: 4,
              fontFamily: 'monospace'
            }}>
              http://[pageId].localhost:3001
            </code>
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: 16, color: '#333' }}>현재 호스트</h3>
          <code style={{
            background: '#f1f3f4',
            padding: '8px 12px',
            borderRadius: 4,
            fontFamily: 'monospace',
            fontSize: 16
          }}>
            {host}
          </code>
        </div>
      </div>
    </div>
  );
}