import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { io } from 'socket.io-client';

function getUserIdFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || payload.sub;
  } catch {
    return null;
  }
}

/**
 * NotificationToggle 컴포넌트
 * 
 * 역할: 헤더에 표시되는 알림 토글 버튼과 드롭다운
 */
function NotificationToggle() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  // 초대 목록 조회
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/invitations/my-invitations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
        setUnreadCount(data.length);
      }
    } catch (error) {
      console.error('초대 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 초대 수락
  const handleAcceptInvitation = async (invitationToken, pageId) => {
    try {
      setProcessing(prev => ({ ...prev, [invitationToken]: 'accepting' }));
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/invitations/${invitationToken}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // 초대 목록에서 제거
        setInvitations(prev => prev.filter(inv => inv.invitationToken !== invitationToken));
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // 초대 정보에서 viewport와 fromTemplate 파라미터 가져오기
        const invitation = invitations.find(inv => inv.invitationToken === invitationToken);
        const viewport = invitation?.viewport;
        const fromTemplate = invitation?.fromTemplate;
        
        // URL 파라미터 구성
        const params = new URLSearchParams();
        if (viewport) params.append('viewport', viewport);
        if (fromTemplate) params.append('fromTemplate', fromTemplate);
        
        const queryString = params.toString();
        const targetUrl = queryString ? `/editor/${pageId}?${queryString}` : `/editor/${pageId}`;
        
        console.log('NotificationToggle: 에디터로 이동:', targetUrl);
        console.log('NotificationToggle: 파라미터:', { viewport, fromTemplate });
        
        // 에디터 페이지로 이동 (파라미터 포함)
        navigate(targetUrl);
        setIsOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message || '초대 수락에 실패했습니다.');
      }
    } catch (error) {
      console.error('초대 수락 실패:', error);
      alert('초대 수락에 실패했습니다.');
    } finally {
      setProcessing(prev => ({ ...prev, [invitationToken]: null }));
    }
  };

  // 초대 거절
  const handleDeclineInvitation = async (invitationToken) => {
    if (!confirm('정말로 이 초대를 거절하시겠습니까?')) {
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, [invitationToken]: 'declining' }));
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/invitations/${invitationToken}/decline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // 초대 목록에서 제거
        setInvitations(prev => prev.filter(inv => inv.invitationToken !== invitationToken));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        const errorData = await response.json();
        alert(errorData.message || '초대 거절에 실패했습니다.');
      }
    } catch (error) {
      console.error('초대 거절 실패:', error);
      alert('초대 거절에 실패했습니다.');
    } finally {
      setProcessing(prev => ({ ...prev, [invitationToken]: null }));
    }
  };

  // 만료 시간 포맷팅
  const formatExpiryTime = (expiresAt) => {
    if (!expiresAt) return '만료 시간 없음';
    
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return '만료됨';
    if (diffDays === 1) return '오늘 만료';
    return `${diffDays}일 후 만료`;
  };

  // 역할 한글화
  const getRoleLabel = (role) => {
    switch (role) {
      case 'OWNER': return '소유자';
      case 'ADMIN': return '관리자';
      case 'EDITOR': return '편집자';
      case 'VIEWER': return '뷰어';
      default: return role;
    }
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 소켓 연결 및 실시간 알림 수신
  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    // 소켓 연결
    const socket = io(`${API_BASE_URL.replace(/\/api$/, '')}/invite`, {
      query: { userId },
      transports: ['websocket'],
      autoConnect: true,
      withCredentials: true,
    });
    socketRef.current = socket;

    // 실시간 초대 알림 수신
    socket.on('new-invitation', (invitation) => {
      setInvitations((prev) => [invitation, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // 연결 해제 시 정리
    return () => {
      socket.disconnect();
    };
  }, []);

  // 초기 로드 및 주기적 업데이트
  useEffect(() => {
    fetchInvitations();
    
    // 10초마다 초대 목록 새로고침 (더 빠른 업데이트)
    const interval = setInterval(fetchInvitations, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 알림 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-pink-600 hover:text-pink-700 transition-all duration-200 bg-white hover:bg-white rounded-lg hover:shadow-md border border-pink-200 hover:border-pink-300"
        title="알림"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* 알림 개수 배지 */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-bounce shadow-sm border border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200/50 max-h-96 overflow-hidden backdrop-blur-sm" style={{ zIndex: 100 }}>
          {/* 헤더 */}
          <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 className="font-semibold text-slate-800">초대 알림</h3>
              </div>
              <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {unreadCount}개의 새로운 초대
              </span>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-slate-500 mt-3 text-sm">초대 목록을 불러오는 중...</p>
              </div>
            ) : invitations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="font-medium text-slate-700">새로운 초대가 없습니다</p>
                <p className="text-sm text-slate-500 mt-1">나중에 다시 확인해주세요</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {invitations.map((invitation) => (
                  <div 
                    key={invitation.id}
                    className="p-4 hover:bg-slate-50 transition-colors duration-150"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium text-purple-700 truncate">
                            {invitation.inviterName}
                          </span>
                          <span className="mx-2 text-purple-400">•</span>
                          <span className="text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            {getRoleLabel(invitation.role)}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-slate-800 text-sm mb-1 truncate">
                          {invitation.pageName}
                        </h4>
                        
                        <div className="flex items-center text-xs text-slate-500">
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className={formatExpiryTime(invitation.expiresAt).includes('만료') ? 'text-red-500 font-medium' : ''}>
                            {formatExpiryTime(invitation.expiresAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1 ml-3 flex-shrink-0">
                        <button
                          onClick={() => handleAcceptInvitation(invitation.invitationToken, invitation.pageId)}
                          disabled={processing[invitation.invitationToken]}
                          className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow flex items-center gap-1"
                        >
                          {processing[invitation.invitationToken] === 'accepting' ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              <span>수락 중</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>수락</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDeclineInvitation(invitation.invitationToken)}
                          disabled={processing[invitation.invitationToken]}
                          className="px-2.5 py-1.5 bg-white text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow flex items-center gap-1"
                        >
                          {processing[invitation.invitationToken] === 'declining' ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-600"></div>
                              <span>거절 중</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>거절</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationToggle; 