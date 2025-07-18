import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import ddukddakLogo from '../assets/page-cube-logo.png';
import TemplateCanvasPreview from '../components/TemplateCanvasPreview';
function DeployedPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [myPages, setMyPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    pageId: null,
    title: '',
  });
  const [submissions, setSubmissions] = useState({});
  const [submissionsModal, setSubmissionsModal] = useState({
    isOpen: false,
    pageId: null,
    title: '',
    data: null,
  });
  // 페이지 submissions 데이터 조회
  const fetchPageSubmissions = async (pageId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch(
        `${API_BASE_URL}/users/pages/${pageId}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Submissions 조회 실패:', error);
    }
    return null;
  };

  // 내 페이지 목록 조회
  const fetchMyPages = async () => {
    try {
      setPagesLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // 모든 페이지 가져오기
      const response = await fetch(`${API_BASE_URL}/users/pages/my-pages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 받아온 페이지 데이터:', data);

        // 중복된 ID 제거 (같은 ID를 가진 첫 번째 항목만 유지)
        const uniquePages = data.filter((page, index, arr) => {
          const firstIndex = arr.findIndex((p) => p.id === page.id);
          return firstIndex === index;
        });

        // 배포된 페이지와 임시저장 페이지 분류
        const deployedPages = uniquePages.filter(page => page.status === 'DEPLOYED');
        const draftPages = uniquePages.filter(page => page.status === 'DRAFT');
        
        // 배포된 페이지의 제목 업데이트 (임시저장에서 배포한 경우 제목 가져오기)
        const updatedDeployedPages = deployedPages.map(deployedPage => {
          // 동일한 ID를 가진 임시저장 페이지 찾기
          const draftVersion = draftPages.find(draft => draft.originalPageId === deployedPage.id);
          
          // 임시저장 페이지가 있고 제목이 있는 경우 제목 업데이트
          if (draftVersion && draftVersion.title && (!deployedPage.title || deployedPage.title === '제목 없음')) {
            return { ...deployedPage, title: draftVersion.title };
          }
          return deployedPage;
        });
        
        // 업데이트된 페이지와 임시저장 페이지 합치기
        const mergedPages = [...updatedDeployedPages, ...draftPages];

        console.log('🔍 업데이트된 페이지:', mergedPages);
        console.log('🚀 배포된 페이지:', updatedDeployedPages);

        setMyPages(mergedPages);

        // 각 페이지의 submissions 데이터 조회
        const submissionsData = {};
        for (const page of updatedDeployedPages) {
          const pageSubmissions = await fetchPageSubmissions(page.id);
          if (pageSubmissions) {
            submissionsData[page.id] = pageSubmissions;
          }
        }
        setSubmissions(submissionsData);
      }
    } catch (error) {
      console.error('페이지 목록 조회 실패:', error);
    } finally {
      setPagesLoading(false);
    }
  };
  useEffect(() => {
    fetchMyPages();
  }, []);
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

  // submissions 모달 열기
  const openSubmissionsModal = (pageId, title) => {
    const submissionData = submissions[pageId];
    setSubmissionsModal({
      isOpen: true,
      pageId,
      title,
      data: submissionData,
    });
  };

  // submissions 모달 닫기
  const closeSubmissionsModal = () => {
    setSubmissionsModal({
      isOpen: false,
      pageId: null,
      title: '',
      data: null,
    });
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
  const deployedPages = myPages.filter((page) => page.status === 'DEPLOYED');
  const mobilePages = deployedPages.filter(
    (page) => page.editingMode === 'mobile'
  );
  const desktopPages = deployedPages.filter(
    (page) => page.editingMode === 'desktop'
  );
  // 페이지 카드 컴포넌트
  const PageCard = ({ page, isMobile = false }) => (
    <div
      key={page.id}
      className="bg-white border border-slate-400 rounded-xl p-6 hover:bg-blue-50 transition-all duration-300 group overflow-hidden h-full flex flex-col"
      style={{ minHeight: '520px' }}
    >
      {/* 미리보기 영역 */}
      <div className="mb-4 flex items-center justify-center">
        {isMobile ? (
          // 모바일 휴대폰 프레임 (TemplateCanvasPreview와 동일한 스타일)
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* 휴대폰 외곽 프레임 */}
              <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[1.5rem] p-1">
                {/* 상단 노치 */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-gray-900 rounded-b-lg z-20"></div>

                {/* 스크린 영역 */}
                <div
                  className="relative bg-white rounded-[1.25rem] overflow-hidden border border-gray-600"
                  style={{
                    width: '200px',
                    height: '400px',
                  }}
                >
                  <TemplateCanvasPreview
                    template={page}
                    className="w-full h-full"
                  />
                </div>

                {/* 홈 인디케이터 (하단) */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-600 rounded-full"></div>

                {/* 사이드 버튼들 */}
                <div className="absolute left-0 top-12 w-0.5 h-4 bg-gray-700 rounded-r-full"></div>
                <div className="absolute left-0 top-20 w-0.5 h-8 bg-gray-700 rounded-r-full"></div>
                <div className="absolute right-0 top-16 w-0.5 h-8 bg-gray-700 rounded-l-full"></div>
              </div>
            </div>
          </div>
        ) : (
          // 데스크톱 화면 프레임 (TemplateCanvasPreview와 동일한 스타일)
          <div className="flex items-center justify-center">
            <div
              className="relative bg-gray-50 overflow-hidden rounded-lg border border-gray-200"
              style={{
                width: '240px',
                height: '180px',
              }}
            >
              <TemplateCanvasPreview
                template={page}
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>

      <div className="relative mb-4">
        <div className="pr-16"> {/* 오른쪽에 버튼 공간 확보 */}
          {editingId === page.id ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => saveEditTitle(page.id)}
              onKeyPress={(e) => e.key === 'Enter' && saveEditTitle(page.id)}
              className="w-full px-3 py-2 text-lg font-bold border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 bg-white"
              autoFocus
            />
          ) : (
            <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 w-full">
              {page.title || '제목 없음'}
            </h3>
          )}

          <p className="text-sm text-slate-600 mb-2">
            배포일:{' '}
            {new Date(page.deployedAt || page.updatedAt).toLocaleDateString()}
          </p>
          {page.subdomain && (
            <p className="text-sm text-slate-600 font-medium">
              도메인: {page.subdomain}.ddukddak.org
            </p>
          )}

          {/* Submissions 버튼 - 여기에는 아무것도 표시하지 않음 */}
        </div>
        {/* 편집/삭제 버튼을 절대 위치로 고정 */}
        <div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => startEditTitle(page.id, page.title)}
            className="p-2 text-slate-600 hover:bg-slate-300 rounded-lg"
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
            onClick={() => openDeleteModal(page.id, page.title)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
            title="삭제"
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
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-auto">
        {/* 제출된 응답 버튼 */}
        {submissions[page.id] && (
          <button
            onClick={() => openSubmissionsModal(page.id, page.title)}
            className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-300 hover:border-slate-500 transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow"
          >
            <span className="font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              제출된 응답
            </span>
            <div className="flex items-center gap-2">
              <span className="bg-slate-700 text-white px-2 py-1 rounded-md text-xs font-medium">
                {submissions[page.id].totalCount}개
              </span>
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        )}
        
        {/* 바로가기/편집 버튼 */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => window.open(`https://${page.subdomain}.ddukddak.org`, '_blank')}
            className="flex-1 px-4 py-2 bg-slate-400 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
          >
            바로가기
          </button>
          <button
            onClick={() => {
              navigate(`/editor/${page.id}`);
            }}
            className="px-4 py-2 bg-white text-slate-600 border border-slate-400 rounded-lg font-medium hover:bg-blue-100 hover:border-slate-600 transition-all duration-200"
          >
            편집
          </button>
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-pink-50 to-rose-50 sticky top-0"
        style={{ position: 'relative', zIndex: 30 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* 로고 섹션 */}
            <div className="flex items-center gap-6">
              <div
                className="relative group cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                <img 
                  src="/ddukddak-logo.png" 
                  alt="DDUKDDAK" 
                  style={{ height: '36px', objectFit: 'contain' }} 
                />
              </div>
            </div>
            {/* 우측 버튼 그룹 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 border border-purple-600 shadow-sm"></div>
                  <p className="text-slate-600 font-medium text-lg">
                    <span className="text-black font-semibold">{user.nickname}</span>님
                  </p>
              </div>
              <div className="relative group">
                <button className="px-4 py-2 bg-white text-slate-600 hover:text-gray-600 rounded-lg transition-all duration-300 font-medium border border-slate-200 hover:border-gray-300 flex items-center gap-2 group">
                  마이페이지
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* 드롭다운 메뉴 */}
                <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-2 flex flex-col gap-1"> {/* gap-1로 간격 최소화 */}
                    {/* 임시 저장 페이지 버튼 */}
                    <button
                      onClick={() => navigate('/dashboard/drafts')}
                      className="w-full px-3 py-2 text-left text-slate-500 hover:text-black rounded-lg transition-all duration-300 font-medium hover:bg-blue-50 flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                      <span className="truncate flex-1">
                        임시 저장
                      </span>
                    </button>
                    {/* 배포된 페이지 버튼 */}
                    <button
                      onClick={() => navigate('/dashboard/deployed')}
                      className="w-full px-3 py-2 text-left text-slate-500 hover:text-black rounded-lg transition-all duration-300 font-medium hover:bg-blue-50 flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                      <span className="truncate flex-1">
                        배포된 페이지
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 로그아웃 버튼 */}
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 font-medium rounded-lg transition-all duration-300 flex items-center gap-2 group"
                style={{ color: '#212455' }}
              >
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-5xl font-bold text-slate-800">배포된 페이지</h2>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-1xl font-medium rounded-full">
              {deployedPages.length}개
            </span>
          </div>
        </div>
        {/* 페이지 목록 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {pagesLoading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-600 font-medium">
                페이지를 불러오는 중...
              </p>
            </div>
          ) : mobilePages.length === 0 && desktopPages.length === 0 ? (
            <div className="text-center py-16 rounded-xl border-2 border-dashed border-slate-200">
              <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-slate-400"
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
              <p className="font-medium text-lg text-slate-800 mb-2">배포된 페이지가 없습니다</p>
              <p className="text-slate-600 mb-4">페이지를 만들어서 배포해보세요</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl font-medium hover:bg-slate-600 hover:text-white transition-colors"
              >
                대시보드로 돌아가기
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 모바일 페이지 섹션 */}
              {mobilePages.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-[#FF9696]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                    </svg>
                    <h4 className="text-lg font-bold text-slate-800">모바일 페이지</h4>
                    <span className="px-2 py-1 bg-[#FF9696] text-white text-sm font-medium rounded-full">
                      {mobilePages.length}개
                    </span>
                  </div>
                  <div className="mx-2 sm:mx-3 md:mx-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-fr">
                      {mobilePages.map((page) => (
                        <div className="w-full h-full" key={page.id}>
                          <PageCard page={page} isMobile={true} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* 구분선 */}
              {mobilePages.length > 0 && desktopPages.length > 0 && (
                <div className="flex items-center gap-4 py-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                    <svg
                      className="w-4 h-4 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                    <span className="text-sm font-medium text-slate-600">
                      데스크톱 페이지
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                </div>
              )}
              {/* 데스크톱 페이지 섹션 */}
              {desktopPages.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-[#9E9EE6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h4 className="text-lg font-bold text-slate-800">데스크톱 페이지</h4>
                    <span className="px-2 py-1 bg-[#9E9EE6] text-white text-sm font-medium rounded-full">
                      {desktopPages.length}개
                    </span>
                  </div>
                  <div className="mx-2 sm:mx-3 md:mx-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-fr">
                      {desktopPages.map((page) => (
                        <div className="w-full h-full" key={page.id}>
                          <PageCard page={page} isMobile={false} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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

      {/* Submissions 모달 */}
      {submissionsModal.isOpen && submissionsModal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-6 bg-slate-700 rounded-full"></span>
                  제출된 응답
                </h3>
                <button
                  onClick={closeSubmissionsModal}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5 text-slate-500"
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

              {/* 통계 요약 */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <span className="text-sm font-medium text-slate-700">
                      참석/가입
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-slate-800 mt-1">
                    {submissionsModal.data.typeStats.attendance}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <span className="text-sm font-medium text-slate-700">
                      댓글
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-slate-800 mt-1">
                    {submissionsModal.data.typeStats.comment}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <span className="text-sm font-medium text-slate-700">
                      의견
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-slate-800 mt-1">
                    {submissionsModal.data.typeStats.slido}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <span className="text-sm font-medium text-slate-700">
                      동아리 가입
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-slate-800 mt-1">
                    {submissionsModal.data.typeStats.other}
                  </p>
                </div>
                <div className="bg-slate-700 text-white px-4 py-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    <span className="text-sm font-medium text-slate-100">
                      전체
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-white mt-1">
                    {submissionsModal.data.totalCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-auto max-h-[calc(90vh-200px)]">
              <div className="p-6 space-y-4">
                {submissionsModal.data.submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-xs font-medium border ${
                            submission.type === 'attendance'
                              ? 'border-slate-300 bg-slate-50 text-slate-700'
                              : submission.type === 'comment'
                                ? 'border-slate-300 bg-slate-50 text-slate-700'
                                : submission.type === 'slido'
                                  ? 'border-slate-300 bg-slate-50 text-slate-700'
                                  : submission.type === 'other'
                                    ? 'border-slate-300 bg-slate-50 text-slate-700'
                                    : 'border-slate-300 bg-slate-50 text-slate-700'
                          }`}
                        >
                          {submission.type === 'attendance'
                            ? '참석/가입'
                            : submission.type === 'comment'
                              ? '댓글'
                              : submission.type === 'slido'
                                ? '의견'
                                : submission.type === 'other'
                                  ? '동아리 가입'
                                  : '기타'}
                        </span>
                        <span className="text-sm text-slate-500">
                          {submission.componentId}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {new Date(submission.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      {submission.type === 'attendance' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 mb-1">이름</span>
                            <p className="font-medium">{submission.data.attendeeName}</p>
                          </div>
                          {submission.data.guestSide && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">구분</span>
                              <p className="font-medium">{submission.data.guestSide}</p>
                            </div>
                          )}
                          {submission.data.attendeeCount && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">참석 인원</span>
                              <p className="font-medium">{submission.data.attendeeCount}명</p>
                            </div>
                          )}
                          {submission.data.contact && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">연락처</span>
                              <p className="font-medium">{submission.data.contact}</p>
                            </div>
                          )}
                          {submission.data.studentId && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">학번</span>
                              <p className="font-medium">{submission.data.studentId}</p>
                            </div>
                          )}
                          {submission.data.major && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">전공</span>
                              <p className="font-medium">{submission.data.major}</p>
                            </div>
                          )}
                          {submission.data.email && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">이메일</span>
                              <p className="font-medium">{submission.data.email}</p>
                            </div>
                          )}
                          {submission.data.motivation && (
                            <div className="flex flex-col col-span-full">
                              <span className="text-xs text-slate-500 mb-1">지원 동기</span>
                              <p className="font-medium">{submission.data.motivation}</p>
                            </div>
                          )}
                          {submission.data.experience && (
                            <div className="flex flex-col col-span-full">
                              <span className="text-xs text-slate-500 mb-1">관련 경험</span>
                              <p className="font-medium">{submission.data.experience}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {submission.type === 'comment' && (
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 mb-1">작성자</span>
                            <p className="font-medium">{submission.data.author}</p>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 mb-1">내용</span>
                            <p className="font-medium">{submission.data.content}</p>
                          </div>
                        </div>
                      )}
                      {submission.type === 'slido' && (
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 mb-1">의견</span>
                            <p className="font-medium">{submission.data.content}</p>
                          </div>
                        </div>
                      )}
                      {submission.type === 'other' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 mb-1">이름</span>
                            <p className="font-medium">{submission.data.attendeeName}</p>
                          </div>
                          {submission.data.guestSide && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">학년/구분</span>
                              <p className="font-medium">{submission.data.guestSide}</p>
                            </div>
                          )}
                          {submission.data.contact && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">연락처</span>
                              <p className="font-medium">{submission.data.contact}</p>
                            </div>
                          )}
                          {submission.data.studentId && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">학번</span>
                              <p className="font-medium">{submission.data.studentId}</p>
                            </div>
                          )}
                          {submission.data.major && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">전공</span>
                              <p className="font-medium">{submission.data.major}</p>
                            </div>
                          )}
                          {submission.data.email && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">이메일</span>
                              <p className="font-medium">{submission.data.email}</p>
                            </div>
                          )}
                          {submission.data.attendeeCount && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">참석 인원</span>
                              <p className="font-medium">{submission.data.attendeeCount}명</p>
                            </div>
                          )}
                          {submission.data.companionCount && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">동반 인원</span>
                              <p className="font-medium">{submission.data.companionCount}명</p>
                            </div>
                          )}
                          {submission.data.mealOption && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">식사 옵션</span>
                              <p className="font-medium">{submission.data.mealOption}</p>
                            </div>
                          )}
                          {submission.data.privacyConsent && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">개인정보 동의</span>
                              <p className="font-medium">
                                {submission.data.privacyConsent ? '동의' : '미동의'}  
                              </p>
                            </div>
                          )}
                          {submission.data.motivation !== undefined &&
                          submission.data.motivation !== null ? (
                            <div className="flex flex-col col-span-full mt-2">
                              <span className="text-xs text-slate-500 mb-1">지원 동기</span>
                              <div className="bg-white p-3 rounded-md border border-slate-200">
                                <p className="text-sm whitespace-pre-wrap">
                                  {submission.data.motivation}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col col-span-full mt-2">
                              <span className="text-xs text-slate-500 mb-1">지원 동기</span>
                              <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                                <p className="text-sm text-slate-400 italic">
                                  지원 동기 정보가 없습니다.
                                </p>
                              </div>
                            </div>
                          )}
                          {submission.data.experience !== undefined &&
                          submission.data.experience !== null ? (
                            <div className="flex flex-col col-span-full mt-2">
                              <span className="text-xs text-slate-500 mb-1">관련 경험</span>
                              <div className="bg-white p-3 rounded-md border border-slate-200">
                                <p className="text-sm whitespace-pre-wrap">
                                  {submission.data.experience}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col col-span-full mt-2">
                              <span className="text-xs text-slate-500 mb-1">관련 경험</span>
                              <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                                <p className="text-sm text-slate-400 italic">
                                  관련 경험 정보가 없습니다.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={closeSubmissionsModal}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default DeployedPage;
