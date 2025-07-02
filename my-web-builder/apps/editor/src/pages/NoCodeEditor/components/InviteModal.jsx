import React, { useState } from 'react';
import { API_BASE_URL } from '../../../config';

/**
 * InviteModal 컴포넌트
 * 
 * 역할: 페이지에 다른 사용자를 초대하는 모달
 * 
 * Props:
 * - isOpen: 모달 열림 상태
 * - onClose: 모달 닫기 함수
 * - pageId: 현재 페이지 ID
 */
function InviteModal({ isOpen, onClose, pageId }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EDITOR');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'

  // 초대 이메일 발송
  const handleSendInvitation = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('이메일을 입력해주세요.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/pages/${pageId}/invitations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          role
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          // 이메일 발송 성공
          setMessage('초대 이메일을 성공적으로 보냈습니다! 🎉');
          setMessageType('success');
          setEmail('');
          // 3초 후 모달 닫기
          setTimeout(() => {
            onClose();
            setMessage('');
          }, 3000);
        } else {
          // 이메일 발송 실패했지만 링크는 생성됨
          setMessage(
            <div>
              <p>{data.message}</p>
              <p style={{ 
                marginTop: '10px', 
                padding: '10px', 
                background: '#f8f9fa', 
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                초대 링크: {data.inviteUrl}
              </p>
            </div>
          );
          setMessageType('error');
        }
      } else {
        setMessage(data.message || '초대 발송에 실패했습니다.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('초대 발송 오류:', error);
      setMessage('네트워크 오류가 발생했습니다.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // 모달 닫기 시 상태 초기화
  const handleClose = () => {
    setEmail('');
    setRole('EDITOR');
    setMessage('');
    setMessageType('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: 'Inter, sans-serif'
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          minWidth: '400px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            👥 팀원 초대하기
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* 설명 */}
        <p style={{
          margin: '0 0 24px 0',
          color: '#6b7280',
          lineHeight: 1.5
        }}>
          이메일 주소를 입력하여 다른 사용자를 이 페이지에 초대하세요.
          초대받은 사용자는 이메일로 초대 링크를 받게 됩니다.
        </p>

        {/* 폼 */}
        <form onSubmit={handleSendInvitation}>
          {/* 이메일 입력 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              이메일 주소 *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              disabled={loading}
            />
          </div>

          {/* 역할 선택 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              역할
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            >
              <option value="VIEWER">보기 권한 (Viewer)</option>
              <option value="EDITOR">편집 권한 (Editor)</option>
              <option value="ADMIN">관리자 권한 (Admin)</option>
            </select>
          </div>

          {/* 메시지 */}
          {message && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              backgroundColor: messageType === 'success' ? '#dcfce7' : '#fef2f2',
              color: messageType === 'success' ? '#166534' : '#dc2626',
              border: `1px solid ${messageType === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}>
              {message}
            </div>
          )}

          {/* 버튼들 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '12px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#d1d5db';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#e5e7eb';
              }}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#2563eb';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#3b82f6';
                }
              }}
              disabled={loading}
            >
              {loading && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              {loading ? '발송 중...' : '📧 초대 보내기'}
            </button>
          </div>
        </form>

        {/* 스피너 애니메이션 */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default InviteModal; 