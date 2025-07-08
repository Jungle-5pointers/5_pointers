import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import InvitationNotifications from '../components/InvitationNotifications';
import NotificationToggle from '../components/NotificationToggle';
import pageCubeLogo from '../assets/page-cube-logo.png';

function randomId() {
  return Math.random().toString(36).substring(2, 10);
}

function DashboardPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [myPages, setMyPages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    pageId: null,
    title: '',
  });
  const [isMyPagesOpen, setIsMyPagesOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMyPagesOpen(false);
      }
    }

    if (isMyPagesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMyPagesOpen]);

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'wedding', label: '웨딩' },
    { value: 'events', label: '이벤트' },
    { value: 'portfolio', label: '포트폴리오' },
  ];

  // 템플릿 목록 조회
  const fetchTemplates = async (category = 'all') => {
    try {
      setLoading(true);
      const url =
        category === 'all'
          ? `${API_BASE_URL}/templates`
          : `${API_BASE_URL}/templates?category=${category}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // 중복된 ID 제거 (같은 ID를 가진 첫 번째 항목만 유지)
        const uniqueTemplates = data.filter((template, index, arr) => {
          const firstIndex = arr.findIndex(t => t.id === template.id);
          return firstIndex === index;
        });
        setTemplates(uniqueTemplates);
      }
    } catch (error) {
      console.error('템플릿 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 내 페이지 목록 조회
  const fetchMyPages = async () => {
    try {
      setPagesLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/users/pages/my-pages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // 중복된 ID 제거 (같은 ID를 가진 첫 번째 항목만 유지)
        const uniquePages = data.filter((page, index, arr) => {
          const firstIndex = arr.findIndex(p => p.id === page.id);
          return firstIndex === index;
        });
        setMyPages(uniquePages);
      }
    } catch (error) {
      console.error('페이지 목록 조회 실패:', error);
    } finally {
      setPagesLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(selectedCategory);
    fetchMyPages();
  }, [selectedCategory]);

  // 템플릿으로 페이지 생성
  const handleCreateFromTemplate = async (templateId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateId: templateId,
          title: `Template Page ${Date.now()}`,
          subdomain: `template-${Date.now()}`,
        }),
      });

      if (response.ok) {
        const newPage = await response.json();
        console.log('새 페이지 생성:', newPage);
        navigate(`/editor/${newPage.id}`);
      } else {
        alert('템플릿 페이지 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('템플릿 페이지 생성 실패:', error);
      alert('템플릿 페이지 생성에 실패했습니다.');
    }
  };

  // 인라인 제목 수정 시작
  const startEditTitle = (pageId, currentTitle) => {
    setEditingId(pageId);
    setEditingTitle(currentTitle);
  };

  // 인라인 제목 수정 취소
  const cancelEditTitle = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // 인라인 제목 수정 저장
  const saveEditTitle = async (pageId) => {
    if (!editingTitle.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (response.ok) {
        fetchMyPages();
        setEditingId(null);
        setEditingTitle('');
      }
    } catch (error) {
      console.error('제목 수정 실패:', error);
    }
  };

  // 삭제 모달 열기
  const openDeleteModal = (pageId, title) => {
    setDeleteModal({ isOpen: true, pageId, title });
  };

  // 삭제 모달 닫기
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, pageId: null, title: '' });
  };

  // 페이지 삭제 실행
  const confirmDeletePage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/users/pages/${deleteModal.pageId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchMyPages();
        closeDeleteModal();
      }
    } catch (error) {
      console.error('페이지 삭제 실패:', error);
    }
  };

  const handleCreateNew = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subdomain: `page-${Date.now()}`,
          title: 'Untitled',
        }),
      });

      if (response.ok) {
        const newPage = await response.json();
        console.log('새 페이지 생성:', newPage);
        navigate(`/editor/${newPage.id}`);
      } else {
        alert('페이지 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('페이지 생성 실패:', error);
      alert('페이지 생성에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100">
      {/* Header */}
      <div
        className="bg-white border-b border-slate-200 sticky top-0"
        style={{ position: 'relative', zIndex: 30 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* 로고 섹션 */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <img
                  src={pageCubeLogo}
                  alt="Page Cube"
                  className="w-10 h-10 object-contain transform group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PAGE CUBE
              </h1>
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-slate-600 font-medium text-sm">
                    <span className="text-blue-600 font-semibold">{user.nickname}</span>님
              </p>
                </div>
              </div>
            </div>

            {/* 우측 버튼 그룹 */}
            <div className="flex items-center gap-3">
              {/* 내 페이지 드롭다운 */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsMyPagesOpen(!isMyPagesOpen)}
                  className="px-4 py-2 bg-white text-slate-600 hover:text-blue-600 rounded-lg transition-all duration-300 font-medium border border-slate-200 hover:border-blue-200 flex items-center gap-2 group"
                >
                  <div className="relative w-5 h-5">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded transform rotate-45 transition-transform duration-300 group-hover:rotate-[225deg]"></div>
                    <div className="absolute inset-1 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded transform rotate-45 transition-transform duration-300 group-hover:rotate-[135deg]"></div>
                  </div>
                  내 페이지
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isMyPagesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 드롭다운 메뉴는 그대로 유지 */}
                {isMyPagesOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200/50 overflow-hidden backdrop-blur-sm z-50">
                    {/* 임시 저장 섹션 */}
                    <div className="p-4 border-b border-slate-100">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">임시 저장</h3>
                          <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            {myPages.filter((page) => page.status === 'DRAFT').length}개
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {pagesLoading ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto"></div>
                          </div>
                        ) : (
                          myPages
                            .filter((page) => page.status === 'DRAFT')
                            .map((draft) => (
                              <div
                                key={draft.id}
                                className="p-2 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 rounded-lg transition-all duration-300 group"
                              >
                                <div className="flex items-center justify-between">
                                  <div 
                                    className="flex-1 cursor-pointer"
                                    onClick={() => navigate(`/editor/${draft.id}`)}
                                  >
                                    {editingId === draft.id ? (
                                      <input
                                        type="text"
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        onBlur={() => saveEditTitle(draft.id)}
                                        onKeyPress={(e) => e.key === 'Enter' && saveEditTitle(draft.id)}
                                        className="w-full px-2 py-1 text-sm border border-amber-300 rounded focus:outline-none focus:border-amber-500"
                                        autoFocus
                                      />
                                    ) : (
                                      <div className="text-sm font-medium text-slate-700">{draft.title || '제목 없음'}</div>
                                    )}
                                    <div className="text-xs text-slate-500 mt-1">
                                      마지막 수정: {new Date(draft.updatedAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => startEditTitle(draft.id, draft.title)}
                                      className="p-1 text-amber-600 hover:bg-amber-100 rounded"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => openDeleteModal(draft.id, draft.title)}
                                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                        {!pagesLoading && myPages.filter((page) => page.status === 'DRAFT').length === 0 && (
                          <div className="text-center py-3 text-slate-500 text-sm">
                            임시 저장된 페이지가 없습니다
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 배포된 페이지 섹션 */}
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">배포된 페이지</h3>
                          <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                            {myPages.filter((page) => page.status === 'DEPLOYED').length}개
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {pagesLoading ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
                          </div>
                        ) : (
                          myPages
                            .filter((page) => page.status === 'DEPLOYED')
                            .map((pub) => (
                              <div
                                key={pub.id}
                                className="p-2 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200 rounded-lg transition-all duration-300 group"
                              >
                                <div className="flex items-center justify-between">
                                  <div 
                                    className="flex-1 cursor-pointer"
                                    onClick={() => navigate(`/editor/${pub.id}`)}
                                  >
                                    {editingId === pub.id ? (
                                      <input
                                        type="text"
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        onBlur={() => saveEditTitle(pub.id)}
                                        onKeyPress={(e) => e.key === 'Enter' && saveEditTitle(pub.id)}
                                        className="w-full px-2 py-1 text-sm border border-emerald-300 rounded focus:outline-none focus:border-emerald-500"
                                        autoFocus
                                      />
                                    ) : (
                                      <div className="text-sm font-medium text-slate-700">{pub.title || '제목 없음'}</div>
                                    )}
                                    <div className="text-xs text-slate-500 mt-1">
                                      배포일: {new Date(pub.deployedAt || pub.updatedAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => startEditTitle(pub.id, pub.title)}
                                      className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => openDeleteModal(pub.id, pub.title)}
                                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                        {!pagesLoading && myPages.filter((page) => page.status === 'DEPLOYED').length === 0 && (
                          <div className="text-center py-3 text-slate-500 text-sm">
                            배포된 페이지가 없습니다
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 알림 토글 */}
              <NotificationToggle />

              {/* 로그아웃 버튼 */}
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-white text-slate-600 hover:text-red-600 rounded-lg transition-all duration-300 font-medium border border-slate-200 hover:border-red-200 flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 메인 헤더 */}
        <div className="text-center mb-16 relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl rotate-45 blur-3xl"></div>
          <div className="relative">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-4">
              큐브로 만드는 멋진 페이지
          </h2>
          <p className="text-lg text-slate-600 font-medium">
              당신만의 특별한 큐브를 조립해보세요
          </p>
          </div>
        </div>

        {/* 빈 페이지 시작하기 섹션 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-xl flex items-center justify-center transform rotate-45">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">빈 페이지부터 시작하기</h3>
              </div>
              {/* <p className="text-slate-600 ml-15">완전히 새로운 큐브를 처음부터 조립해보세요</p> */}
            </div>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-xl transition-all duration-300 font-medium flex items-center gap-2"
            >
              새 큐브 만들기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 테마 선택 섹션 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-xl flex items-center justify-center transform rotate-45">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">큐브 템플릿</h3>
                <p className="text-slate-600">템플릿을 선택하여 쉽게 웹페이지를 만들어보세요</p>
              </div>
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* 템플릿 리스트 */}
          <div className="relative">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-600 font-medium">큐브 템플릿을 불러오는 중...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="font-medium text-slate-800 mb-2">이 테마의 큐브가 없습니다</p>
                <p className="text-slate-600">다른 테마를 선택해보세요</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleCreateFromTemplate(template.id)}
                    className="group cursor-pointer bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="p-4">
                      {template.thumbnail_url ? (
                        <div className="relative rounded-lg overflow-hidden mb-4 aspect-video">
                          <img
                            src={template.thumbnail_url}
                            alt={template.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="relative rounded-lg overflow-hidden mb-4 aspect-video bg-slate-100 flex items-center justify-center">
                          <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center transform rotate-45">
                            <div className="w-8 h-8 bg-slate-300 rounded-lg"></div>
                          </div>
                        </div>
                      )}
                      <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600 font-medium">
                          {template.category}
                        </span>
                        <span className="text-sm text-slate-500">
                          {template.usageCount}회 사용
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                페이지 삭제
              </h3>
              <p className="text-slate-600 mb-6">
                <span className="font-medium text-slate-800">
                  "{deleteModal.title}"
                </span>{' '}
                페이지를 삭제하시겠습니까?
                <br />
                <span className="text-sm text-red-600">
                  이 작업은 되돌릴 수 없습니다.
                </span>
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmDeletePage}
                  className="flex-1 px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors"
                >
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;

