import React, { useState, useEffect } from 'react';
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

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'wedding', label: '웨딩' },
    { value: 'events', label: '이벤트' },
    { value: 'portfolio', label: '포트폴리오' },
  ];

  // 기본 웨딩 템플릿 정의
  const defaultWeddingTemplate = {
    id: 'elegant-wedding-2024',
    name: 'Elegant Wedding Invitation',
    category: 'wedding',
    tags: ['wedding', 'invitation', 'elegant', 'romantic', 'pink', 'modern'],
    usageCount: 0,
    isPublic: true,
    content: [
      {
        id: 'wedding-header-1',
        type: 'weddingInvite',
        x: 0, y: 0, width: 375, height: 400,
        props: {
          title: 'Wedding Invitation',
          subtitle: '결혼합니다',
          description: '두 사람이 하나가 되는 소중한 날',
          groomName: '김민수',
          brideName: '박지영',
          date: '2024년 4월 20일',
          time: '오후 2시 30분',
          venue: '웨딩홀 그랜드볼룸',
          message: '저희의 새로운 시작을 축복해 주세요',
          backgroundColor: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fef3c7 100%)',
          textColor: '#be185d',
          accentColor: '#f59e0b',
          titleFontFamily: '"Playfair Display", serif',
          bodyFontFamily: '"Noto Sans KR", sans-serif',
          titleFontSize: 28,
          subtitleFontSize: 20,
          bodyFontSize: 14
        }
      },
      {
        id: 'wedding-datetime-1',
        type: 'dday',
        x: 20, y: 420, width: 335, height: 100,
        props: {
          targetDate: '2024-04-20',
          title: '2024년 4월 20일 토요일',
          subtitle: '오후 2시 30분',
          backgroundColor: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
          titleColor: '#1f2937', borderRadius: '16px'
        }
      },
      {
        id: 'wedding-venue-1',
        type: 'mapInfo',
        x: 20, y: 540, width: 335, height: 120,
        props: {
          venueName: '웨딩홀 그랜드볼룸',
          address: '서울특별시 강남구 테헤란로 123',
          details: '지하철 2호선 강남역 3번 출구 도보 5분\n주차 가능 (발렛파킹 서비스)',
          backgroundColor: 'linear-gradient(135deg, #fef3c7 0%, #fdf2f8 100%)',
          borderRadius: '16px'
        }
      },
      {
        id: 'groom-contact-1',
        type: 'weddingContact',
        x: 20, y: 680, width: 160, height: 120,
        props: {
          title: '신랑측 연락처',
          groomName: '김민수',
          groomPhone1: '010',
          groomPhone2: '1234',
          groomPhone3: '5678',
          groomFatherName: '김철수',
          groomFatherPhone1: '010',
          groomFatherPhone2: '9876',
          groomFatherPhone3: '5432',
          backgroundColor: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          borderRadius: '16px'
        }
      },
      {
        id: 'bride-contact-1',
        type: 'weddingContact',
        x: 195, y: 680, width: 160, height: 120,
        props: {
          title: '신부측 연락처',
          brideName: '박지영',
          bridePhone1: '010',
          bridePhone2: '8765',
          bridePhone3: '4321',
          brideFatherName: '박영수',
          brideFatherPhone1: '010',
          brideFatherPhone2: '2468',
          brideFatherPhone3: '1357',
          backgroundColor: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
          borderRadius: '16px'
        }
      }
    ]
  };

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
        
        // 웨딩 카테고리이거나 전체 카테고리일 때 기본 웨딩 템플릿 추가
        if ((category === 'wedding' || category === 'all') && !uniqueTemplates.find(t => t.id === defaultWeddingTemplate.id)) {
          uniqueTemplates.unshift(defaultWeddingTemplate);
        }
        
        setTemplates(uniqueTemplates);
      }
    } catch (error) {
      console.error('템플릿 조회 실패:', error);
      // API 실패 시에도 웨딩 템플릿은 표시
      if (category === 'wedding' || category === 'all') {
        setTemplates([defaultWeddingTemplate]);
      }
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

      // 로컬 웨딩 템플릿인 경우 직접 처리
      if (templateId === 'elegant-wedding-2024') {
        console.log('웨딩 템플릿 생성 시작:', {
          templateId,
          componentCount: defaultWeddingTemplate.content.length,
          components: defaultWeddingTemplate.content
        });
        
        const response = await fetch(`${API_BASE_URL}/users/pages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: 'Elegant Wedding Invitation',
            subdomain: `wedding-${Date.now()}`,
            content: defaultWeddingTemplate.content, // 직접 컴포넌트 배열 전달
          }),
        });

        if (response.ok) {
          const newPage = await response.json();
          console.log('웨딩 템플릿 페이지 생성 성공:', {
            pageId: newPage.id,
            title: newPage.title,
            contentType: typeof newPage.content,
            contentLength: Array.isArray(newPage.content) ? newPage.content.length : 'not array',
            content: newPage.content
          });
          navigate(`/editor/${newPage.id}`);
          return;
        } else {
          const errorData = await response.text();
          console.error('웨딩 템플릿 페이지 생성 실패:', response.status, errorData);
        }
      }

      // 일반 템플릿인 경우 기존 로직 사용
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
      {/* Header - 높이 축소 */}
      <div
        className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-200/30"
        style={{ position: 'relative', zIndex: 30 }}
      >
        <div className="max-w-6xl mx-auto px-2 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* 로고 추가 */}
              <div className="mr-3">
                <img
                  src={pageCubeLogo}
                  alt="Page Cube"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mr-4">
                PAGE CUBE
              </h1>

              {/* 환영 메시지를 바로 옆에 배치 */}
              <p className="text-slate-600 font-medium text-sm">
                환영합니다,{' '}
                <span className="text-blue-600 font-semibold">
                  {user.nickname}
                </span>
                님
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* 알림 토글 */}
              <NotificationToggle />

              <button
                onClick={onLogout}
                className="px-4 py-2 text-slate-600 hover:text-white bg-white/60 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 rounded-lg transition-all duration-300 backdrop-blur-sm border border-blue-200/50 font-medium shadow-sm hover:shadow-md text-sm"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 메인 헤더 - 섹션 밖으로 빼서 가운데 정렬 */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            어떤 멋진 페이지를 만들어볼까요?
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            템플릿을 선택하거나 빈 페이지부터 시작해보세요
          </p>

          {/* 카테고리 필터 - 가운데 정렬 */}
          <div className="flex justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 템플릿 섹션 - 간소화 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-blue-200/30">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-blue-500 mx-auto"></div>
              <p className="text-slate-500 mt-2 font-medium text-sm">
                템플릿 로딩 중...
              </p>
            </div>
          ) : templates.length === 0 ? (
            // 템플릿이 없을 때 - 가운데 정렬
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="font-medium text-slate-500">
                선택한 카테고리에 템플릿이 없습니다
              </p>
            </div>
          ) : (
            // 템플릿이 있을 때 - 왼쪽 정렬 (가로 스크롤)
            <div className="overflow-x-auto">
              <div
                className="flex gap-4 pb-4"
                style={{ minWidth: 'max-content' }}
              >
                {/* 템플릿 카드들 - 높이 축소 */}
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleCreateFromTemplate(template.id)}
                    className="group cursor-pointer bg-white hover:bg-blue-50/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg border border-slate-200 hover:border-blue-300 min-w-[200px]"
                  >
                    {template.thumbnail_url ? (
                      <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="w-full h-24 object-cover rounded-lg mb-3 group-hover:scale-102 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-3 flex items-center justify-center group-hover:scale-102 transition-transform duration-300">
                        <svg
                          className="w-8 h-8 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                    )}
                    <h4 className="font-bold text-slate-800 text-sm mb-2 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium">
                        {template.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        {template.usageCount}회 사용
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 빈 페이지부터 시작하기 버튼 */}
        <div className="text-center mb-8">
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
          >
            + 빈 페이지부터 시작하기
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Drafts Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-blue-200/30">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">임시 저장</h3>
                <span className="ml-2 px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                  {myPages.filter((page) => page.status === 'DRAFT').length}개
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {pagesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                  <p className="text-slate-500 mt-2">로딩 중...</p>
                </div>
              ) : (
                myPages
                  .filter((page) => page.status === 'DRAFT')
                  .map((draft) => (
                    <div
                      key={draft.id}
                      className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 rounded-lg transition-all duration-300 group hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() =>
                            editingId !== draft.id &&
                            navigate(`/editor/${draft.id}`)
                          }
                          className={`flex-1 ${editingId !== draft.id ? 'cursor-pointer' : ''}`}
                        >
                          {editingId === draft.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) =>
                                  setEditingTitle(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter')
                                    saveEditTitle(draft.id);
                                  if (e.key === 'Escape') cancelEditTitle();
                                }}
                                className="flex-1 px-2 py-1 text-slate-800 font-medium bg-white border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveEditTitle(draft.id);
                                }}
                                className="p-1 text-green-600 hover:text-green-700"
                                title="저장"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEditTitle();
                                }}
                                className="p-1 text-red-600 hover:text-red-700"
                                title="취소"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div>
                              <span className="text-slate-800 font-medium">
                                {draft.title}
                              </span>
                              <p className="text-sm text-slate-500 mt-1">
                                {new Date(draft.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditTitle(draft.id, draft.title);
                            }}
                            className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                            title="제목 수정"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(draft.id, draft.title);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            title="페이지 삭제"
                          >
                            <svg
                              className="w-4 h-4"
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
                          </button>
                          <svg
                            className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))
              )}
              {!pagesLoading &&
                myPages.filter((page) => page.status === 'DRAFT').length ===
                  0 && (
                  <div className="text-center py-8 text-slate-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="font-medium">임시 저장된 페이지가 없습니다</p>
                  </div>
                )}
            </div>
          </div>

          {/* Published Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-blue-200/30">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  배포된 페이지
                </h3>
                <span className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                  {myPages.filter((page) => page.status === 'DEPLOYED').length}
                  개
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {pagesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                  <p className="text-slate-500 mt-2">로딩 중...</p>
                </div>
              ) : (
                myPages
                  .filter((page) => page.status === 'DEPLOYED')
                  .map((pub) => (
                    <div
                      key={pub.id}
                      className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200 rounded-lg transition-all duration-300 group hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() =>
                            editingId !== pub.id &&
                            navigate(`/editor/${pub.id}`)
                          }
                          className={`flex-1 ${editingId !== pub.id ? 'cursor-pointer' : ''}`}
                        >
                          {editingId === pub.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) =>
                                  setEditingTitle(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditTitle(pub.id);
                                  if (e.key === 'Escape') cancelEditTitle();
                                }}
                                className="flex-1 px-2 py-1 text-slate-800 font-medium bg-white border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveEditTitle(pub.id);
                                }}
                                className="p-1 text-green-600 hover:text-green-700"
                                title="저장"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEditTitle();
                                }}
                                className="p-1 text-red-600 hover:text-red-700"
                                title="취소"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div>
                              <span className="text-slate-800 font-medium">
                                {pub.title}
                              </span>
                              <p className="text-sm text-slate-500 mt-1">
                                {new Date(pub.updatedAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-emerald-600 mt-1">
                                {pub.subdomain}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-emerald-700 bg-emerald-200 px-2 py-1 rounded-full font-medium">
                            Live
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditTitle(pub.id, pub.title);
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="제목 수정"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(pub.id, pub.title);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            title="페이지 삭제"
                          >
                            <svg
                              className="w-4 h-4"
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
                          </button>
                          <svg
                            className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))
              )}
              {!pagesLoading &&
                myPages.filter((page) => page.status === 'DEPLOYED').length ===
                  0 && (
                  <div className="text-center py-8 text-slate-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                      />
                    </svg>
                    <p className="font-medium">배포된 페이지가 없습니다</p>
                  </div>
                )}
            </div>
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
