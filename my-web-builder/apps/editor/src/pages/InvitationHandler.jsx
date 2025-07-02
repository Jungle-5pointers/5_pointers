import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

/**
 * InvitationHandler 컴포넌트
 * 
 * 역할: 초대 링크(/invite/:invitationToken)를 처리하는 전용 페이지
 * 
 * 로직:
 * 1. URL에서 invitationToken 추출
 * 2. 로그인 상태 확인
 * 3. 로그인 안된 경우: 현재 URL을 저장하고 로그인 페이지로 리디렉션
 * 4. 로그인 된 경우: 초대 수락 API 호출 후 에디터로 이동
 */
function InvitationHandler() {
  const { invitationToken } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitationInfo, setInvitationInfo] = useState(null);

  // 로그인 상태 확인 함수
  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // JWT 토큰의 만료 시간 확인
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('토큰 파싱 오류:', error);
      return false;
    }
  };

  // 초대 정보 조회 (로그인 불필요)
  const fetchInvitationInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invitations/${invitationToken}`);
      
      if (!response.ok) {
        throw new Error('초대 링크가 유효하지 않거나 만료되었습니다.');
      }
      
      const data = await response.json();
      setInvitationInfo(data);
      return data;
    } catch (error) {
      console.error('초대 정보 조회 실패:', error);
      setError(error.message);
      throw error;
    }
  };

  // 초대 수락 (로그인 필요)
  const acceptInvitation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/invitations/${invitationToken}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '초대 수락에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('초대 수락 성공:', data);
      
      // 에디터 페이지로 이동
      navigate(`/editor/${data.pageId}`);
      
    } catch (error) {
      console.error('초대 수락 실패:', error);
      setError(error.message);
    }
  };

  // 메인 로직
  useEffect(() => {
    const handleInvitation = async () => {
      if (!invitationToken) {
        setError('유효하지 않은 초대 링크입니다.');
        setLoading(false);
        return;
      }

      try {
        // 1. 먼저 초대 정보를 조회해서 유효한지 확인
        console.log('초대 정보 조회 중...');
        await fetchInvitationInfo();
        
        // 2. 로그인 상태 확인
        console.log('로그인 상태 확인 중...');
        const loggedIn = isLoggedIn();
        
        if (!loggedIn) {
          // 3. 로그인되지 않은 경우: 현재 URL을 저장하고 로그인 페이지로 리디렉션
          console.log('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
          
          // 현재 전체 URL을 저장 (쿼리 파라미터 포함)
          const currentUrl = window.location.href;
          localStorage.setItem('redirectUrl', currentUrl);
          
          // 로그인 페이지로 이동
          navigate('/login');
          return;
        }
        
        // 4. 로그인된 경우: 자동으로 초대 수락
        console.log('로그인된 사용자입니다. 초대를 수락합니다.');
        await acceptInvitation();
        
      } catch (error) {
        console.error('초대 처리 중 오류:', error);
        // 오류가 발생해도 초대 정보 조회는 성공했을 수 있으므로 loading은 false로 설정
        setLoading(false);
      }
    };

    handleInvitation();
  }, [invitationToken, navigate]);

  // 로딩 중일 때
  if (loading && !error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e9ecef',
            borderTop: '3px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h2 style={{ margin: '0 0 10px 0', color: '#343a40' }}>초대 처리 중...</h2>
          <p style={{ margin: 0, color: '#6c757d' }}>잠시만 기다려주세요.</p>
        </div>
        
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // 오류가 발생했을 때
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '90%',
          border: '1px solid #ffebee'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>초대 링크 오류</h2>
          <p style={{ margin: '0 0 20px 0', color: '#666', lineHeight: 1.5 }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            메인 페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  // 초대 정보가 있고 로그인도 되어 있는 경우 (수락 진행 중)
  if (invitationInfo) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '90%'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
          <h2 style={{ margin: '0 0 20px 0', color: '#343a40' }}>페이지 초대</h2>
          <div style={{ marginBottom: '30px', lineHeight: 1.6, color: '#666' }}>
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>{invitationInfo.inviterName}</strong>님이 
              <br />
              '<strong>{invitationInfo.pageName}</strong>' 페이지에
              <br />
              당신을 초대했습니다.
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
              역할: <span style={{ color: '#007bff', fontWeight: 'bold' }}>{invitationInfo.role}</span>
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <button
              onClick={acceptInvitation}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              초대 수락
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              거절
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default InvitationHandler; 