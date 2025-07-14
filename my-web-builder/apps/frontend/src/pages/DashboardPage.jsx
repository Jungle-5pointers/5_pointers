import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import InvitationNotifications from '../components/InvitationNotifications';
import NotificationToggle from '../components/NotificationToggle';
import TemplateCanvasPreview from '../components/TemplateCanvasPreview';
import AttendanceSummary from '../components/AttendanceSummary';
const ddukddakLogo = '/ddukddak-logo.png';

function randomId() {
  return Math.random().toString(36).substring(2, 10);
}

function DashboardPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [myPages, setMyPages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState('all');
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
  
  // 참석 의사 전달 모달 상태
  const [attendanceModal, setAttendanceModal] = useState({
    isOpen: false,
    pageId: null,
  });

  // 모바일과 데스크톱 템플릿 상태
  const [mobileTemplates, setMobileTemplates] = useState([]);
  const [desktopTemplates, setDesktopTemplates] = useState([]);
  
  // 전체 템플릿 데이터 (페이지네이션용)
  const [allMobileTemplates, setAllMobileTemplates] = useState([]);
  const [allDesktopTemplates, setAllDesktopTemplates] = useState([]);
  
  // 페이지네이션 상태
  const [mobileCurrentPage, setMobileCurrentPage] = useState(1);
  const [mobileTotalPages, setMobileTotalPages] = useState(1);
  const [mobileTotalCount, setMobileTotalCount] = useState(0);
  const [desktopCurrentPage, setDesktopCurrentPage] = useState(1);
  const [desktopTotalPages, setDesktopTotalPages] = useState(1);
  const [desktopTotalCount, setDesktopTotalCount] = useState(0);
  
  const mobileItemsPerPage = 4;
  const desktopItemsPerPage = 8;



  const categories = [
    { value: 'all', label: '전체' },
    { value: 'wedding', label: '웨딩' },
    { value: 'events', label: '이벤트' },
    { value: 'portfolio', label: '포트폴리오' },
  ];

  const deviceTypes = [
    { value: 'all', label: '전체' },
    { value: 'mobile', label: '모바일' },
    { value: 'desktop', label: '데스크톱' },
  ];

  // 모바일 템플릿 조회
  const fetchMobileTemplates = async (category = 'all', page = 1) => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/templates`;
      const params = [];
      
      if (category !== 'all') {
        params.push(`category=${category}`);
      }
      params.push(`editingMode=mobile`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const uniqueTemplates = (Array.isArray(data) ? data : []).filter((template, index, arr) => {
          const firstIndex = arr.findIndex(t => t.id === template.id);
          return firstIndex === index;
        });
        
        // 클라이언트 사이드 페이지네이션
        const startIndex = (page - 1) * mobileItemsPerPage;
        const endIndex = startIndex + mobileItemsPerPage;
        const paginatedTemplates = uniqueTemplates.slice(startIndex, endIndex);
        
        setMobileTotalPages(Math.ceil(uniqueTemplates.length / mobileItemsPerPage));
        setMobileTotalCount(uniqueTemplates.length);
        
        return paginatedTemplates;
      }
    } catch (error) {
      console.error('모바일 템플릿 조회 실패:', error);
    }
    return [];
  };

  // 데스크톱 템플릿 조회
  const fetchDesktopTemplates = async (category = 'all', page = 1) => {
    try {
      let url = `${API_BASE_URL}/templates`;
      const params = [];
      
      if (category !== 'all') {
        params.push(`category=${category}`);
      }
      params.push(`editingMode=desktop`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const uniqueTemplates = (Array.isArray(data) ? data : []).filter((template, index, arr) => {
          const firstIndex = arr.findIndex(t => t.id === template.id);
          return firstIndex === index;
        });
        
        // 클라이언트 사이드 페이지네이션
        const startIndex = (page - 1) * desktopItemsPerPage;
        const endIndex = startIndex + desktopItemsPerPage;
        const paginatedTemplates = uniqueTemplates.slice(startIndex, endIndex);
        
        setDesktopTotalPages(Math.ceil(uniqueTemplates.length / desktopItemsPerPage));
        setDesktopTotalCount(uniqueTemplates.length);
        
        return paginatedTemplates;
      }
    } catch (error) {
      console.error('데스크톱 템플릿 조회 실패:', error);
    }
    return [];
  };

  // 통합 템플릿 조회 함수
  const fetchTemplates = async (category = 'all', device = 'all') => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/templates`;
      const params = [];
      
      if (category !== 'all') {
        params.push(`category=${category}`);
      }
      if (device !== 'all') {
        params.push(`editingMode=${device}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      console.log('템플릿 조회 URL:', url);
      const response = await fetch(url);
      console.log('템플릿 조회 응답:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('템플릿 원본 데이터:', data);
        const uniqueTemplates = data.filter((template, index, arr) => {
          const firstIndex = arr.findIndex(t => t.id === template.id);
          return firstIndex === index;
        });
        console.log('중복 제거된 템플릿:', uniqueTemplates);

        if (device === 'all') {
          // 모바일과 데스크톱 템플릿 분리
          const mobileData = uniqueTemplates.filter(t => t.editingMode === 'mobile');
          const desktopData = uniqueTemplates.filter(t => t.editingMode === 'desktop');
          
          console.log('모바일 템플릿:', mobileData);
          console.log('데스크톱 템플릿:', desktopData);
          
          // 전체 데이터 저장
          setAllMobileTemplates(mobileData);
          setAllDesktopTemplates(desktopData);
          
          // 모바일 페이지네이션
          const mobileStart = (mobileCurrentPage - 1) * mobileItemsPerPage;
          const mobileEnd = mobileStart + mobileItemsPerPage;
          const mobilePagedData = mobileData.slice(mobileStart, mobileEnd);
          setMobileTemplates(mobilePagedData);
          setMobileTotalPages(Math.ceil(mobileData.length / mobileItemsPerPage));
          setMobileTotalCount(mobileData.length);
          
          // 데스크톱 페이지네이션
          const desktopStart = (desktopCurrentPage - 1) * desktopItemsPerPage;
          const desktopEnd = desktopStart + desktopItemsPerPage;
          const desktopPagedData = desktopData.slice(desktopStart, desktopEnd);
          setDesktopTemplates(desktopPagedData);
          setDesktopTotalPages(Math.ceil(desktopData.length / desktopItemsPerPage));
          setDesktopTotalCount(desktopData.length);
          
          console.log('설정된 모바일 템플릿:', mobilePagedData);
          console.log('설정된 데스크톱 템플릿:', desktopPagedData);
          
          setTemplates([]); // 기존 templates는 비움
        } else {
          setTemplates(uniqueTemplates);
          setMobileTemplates([]);
          setDesktopTemplates([]);
        }
      } else {
        console.error('템플릿 조회 실패:', response.status);
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
    // 필터가 변경되면 첫 페이지로 리셋
    setMobileCurrentPage(1);
    setDesktopCurrentPage(1);
    fetchTemplates(selectedCategory, selectedDevice);
    fetchMyPages();
  }, [selectedCategory, selectedDevice]);

  // 페이지 변경 시 템플릿 조회 (스크롤 위치 유지)
  useEffect(() => {
    // 필터 변경이 아닌 페이지 변경일 때만 실행
    if (mobileCurrentPage > 1 || desktopCurrentPage > 1) {
      // 페이지네이션 시에는 저장된 전체 데이터를 사용하여 스크롤 위치 유지
      if (selectedDevice === 'all') {
        // 모바일 페이지네이션
        const mobileStart = (mobileCurrentPage - 1) * mobileItemsPerPage;
        const mobileEnd = mobileStart + mobileItemsPerPage;
        const mobilePagedData = allMobileTemplates.slice(mobileStart, mobileEnd);
        setMobileTemplates(mobilePagedData);
        
        // 데스크톱 페이지네이션
        const desktopStart = (desktopCurrentPage - 1) * desktopItemsPerPage;
        const desktopEnd = desktopStart + desktopItemsPerPage;
        const desktopPagedData = allDesktopTemplates.slice(desktopStart, desktopEnd);
        setDesktopTemplates(desktopPagedData);
      }
    }
  }, [mobileCurrentPage, desktopCurrentPage, allMobileTemplates, allDesktopTemplates, selectedDevice]);

  // 페이지네이션 핸들러 (스크롤 위치 유지)
  const handlePageChange = (deviceType, newPage) => {
    // 현재 스크롤 위치 저장
    const scrollPosition = window.scrollY;
    
    // 페이지 변경
    if (deviceType === 'mobile') {
      setMobileCurrentPage(newPage);
    } else {
      setDesktopCurrentPage(newPage);
    }
    
    // 다음 프레임에서 스크롤 위치 복원
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosition);
    });
  };

  // 템플릿으로 페이지 생성
  const handleCreateFromTemplate = async (template) => {
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
          templateId: template.id,
          title: `Template Page ${Date.now()}`,
          subdomain: `template-${Date.now()}`,
        }),
      });

      if (response.ok) {
        const newPage = await response.json();
        console.log('새 페이지 생성:', newPage);
        // 템플릿의 편집 기준에 따라 뷰포트 설정
        const viewport = template.editingMode === 'mobile' ? 'mobile' : 'desktop';
        const url = `/editor/${newPage.id}?viewport=${viewport}&fromTemplate=true`;
        console.log('네비게이션 URL:', url, 'template.editingMode:', template.editingMode);
        navigate(url);
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

  // 참석 의사 전달 모달 열기
  const openAttendanceModal = (pageId) => {
    setAttendanceModal({ isOpen: true, pageId });
  };

  // 참석 의사 전달 모달 닫기
  const closeAttendanceModal = () => {
    setAttendanceModal({ isOpen: false, pageId: null });
  };

  // 서브도메인 표시 헬퍼 함수 - 페이지 상태에 따라 다른 표시 로직 적용
  const getDisplaySubdomain = (subdomain, title, status) => {
    if (!subdomain) return 'N/A';
    
    // DEPLOYED 상태인 페이지는 사용자가 입력한 실제 subdomain을 그대로 표시
    if (status === 'DEPLOYED') {
      return subdomain;
    }
    
    // DRAFT 상태인 페이지만 UUID 패턴 등 다른 처리 적용
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(subdomain)) {
      // UUID인 경우 제목과 함께 표시하거나 축약
      if (title && title !== '제목 없음' && title !== 'Untitled') {
        return `${title} (${subdomain.substring(0, 8)}...)`;
      }
      return `${subdomain.substring(0, 8)}...`;
    }
    
    // page- 형태의 자동 생성된 서브도메인인 경우 날짜 변환
    if (subdomain.startsWith('page-')) {
      const timestamp = subdomain.replace('page-', '');
      const date = new Date(parseInt(timestamp));
      if (!isNaN(date.getTime()) && timestamp.length === 13) {
        return `page-${date.toLocaleDateString('ko-KR')}`;
      }
    }
    
    // 나머지는 그대로 표시
    return subdomain;
  };

  // 서브도메인 URL 생성 헬퍼 함수
  const getSubdomainUrl = (subdomain) => {
    if (!subdomain) return '#';
    
    const isProduction = process.env.NODE_ENV === 'production';
    return isProduction 
      ? `https://${subdomain}.ddukddak.org`
      : `http://${subdomain}.localhost:3001`;
  };

  // 도메인 복사 함수
  const copyDomainToClipboard = (subdomain, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const url = getSubdomainUrl(subdomain);
    navigator.clipboard.writeText(url).then(() => {
      // 임시 알림 표시 (실제 구현에서는 toast 라이브러리를 사용할 수 있음)
      const originalText = e.target.title;
      e.target.title = '복사됨!';
      setTimeout(() => {
        e.target.title = originalText;
      }, 1000);
    }).catch(() => {
      // 복사 실패 시 폴백
      alert(`도메인 주소: ${url}`);
    });
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
              <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-blue-800 bg-clip-text text-transparent">
                DDUKDDAK
              </h1>
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 border border-green-600 shadow-sm"></div>
              <p className="text-slate-600 font-medium text-sm">
                    <span className="text-blue-600 font-semibold">{user.nickname}</span>님
              </p>
                </div>
              </div>
            </div>

            {/* 우측 버튼 그룹 */}
            <div className="flex items-center gap-3">
              {/* 마이페이지 드롭다운 */}
              <div className="relative group">
                <button className="px-4 py-2 bg-white text-slate-600 hover:text-blue-600 rounded-lg transition-all duration-300 font-medium border border-slate-200 hover:border-blue-200 flex items-center gap-2 group">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  마이페이지
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          <h3 className="text-sm font-bold text-slate-800">제작중인 페이지</h3>
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
                                      className="p-1 text-pink-600 hover:bg-pink-100 rounded"
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
                            제작중인 페이지가 없습니다.
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
                            {myPages.filter((page) => page.status === 'DEPLOYED' || (page.subdomain && page.subdomain.trim() !== '')).length}개
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
                            .filter((page) => page.status === 'DEPLOYED' || (page.subdomain && page.subdomain.trim() !== ''))
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
                                      {pub.status === 'DEPLOYED' ? 
                                        `배포일: ${new Date(pub.deployedAt || pub.updatedAt).toLocaleDateString()}` :
                                        (
                                          <div className="flex items-center gap-1">
                                            <span>도메인: {getDisplaySubdomain(pub.subdomain, pub.title, pub.status)}</span>
                                            {pub.subdomain && (
                                              <a 
                                                href={getSubdomainUrl(pub.subdomain)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-emerald-600 hover:text-emerald-800 flex items-center"
                                                title={`${getSubdomainUrl(pub.subdomain)} 페이지 열기`}
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                              </a>
                                            )}
                                          </div>
                                        )
                                      }
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => openAttendanceModal(pub.id)}
                                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                      title="참석 현황"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                      </svg>
                                    </button>
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
                                      className="p-1 text-pink-600 hover:bg-pink-100 rounded"
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
                        {!pagesLoading && myPages.filter((page) => page.status === 'DEPLOYED' || (page.subdomain && page.subdomain.trim() !== '')).length === 0 && (
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
                className="px-4 py-2 bg-white border border-pink-200 hover:border-pink-300 text-pink-600 hover:text-pink-700 font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 group"
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
      <div className="max-w-7xl mx-auto px-6 py-8 bg-white">
        {/* 메인 헤더 */}
        <div className="text-center mb-8">
          <p className="text-3xl text-slate-500 font-light">
            사랑하는 사람들과 함께하는 특별한 순간
          </p>
        </div>

        {/* 테마 선택 섹션 */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-pink-200/50 border border-pink-100 p-8 mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-700/10 to-blue-800/10 rounded-xl flex items-center justify-center transform rotate-45">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-700 to-blue-800 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">이벤트 템플릿</h3>
              </div>
            </div>

            {/* 필터 버튼들 */}
            <div className="flex flex-col gap-4">
              {/* 테마 카테고리 */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700 min-w-fit">테마</span>
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`px-3 py-1.5 rounded-lg transition-all duration-300 font-medium text-sm flex items-center gap-1.5 min-w-[70px] justify-center ${
                        selectedCategory === category.value
                          ? 'bg-pink-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-600'
                      }`}
                    >
                      {category.value === 'all' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      )}
                      {category.value === 'wedding' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                      {category.value === 'events' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {category.value === 'portfolio' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
                        </svg>
                      )}
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 디바이스 타입 */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700 min-w-fit">기기</span>
                <div className="flex gap-2">
                  {deviceTypes.map((device) => (
                    <button
                      key={device.value}
                      onClick={() => setSelectedDevice(device.value)}
                      className={`px-3 py-1.5 rounded-lg transition-all duration-300 font-medium text-sm flex items-center gap-1.5 min-w-[70px] justify-center ${
                        selectedDevice === device.value
                          ? 'bg-pink-500 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-600'
                      }`}
                    >
                      {device.value === 'mobile' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                        </svg>
                      )}
                      {device.value === 'desktop' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                      {device.value === 'all' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                        </svg>
                      )}
                      {device.label}
                    </button>
                  ))}
                </div>
              </div>
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
            ) : (selectedDevice === 'all' && mobileTotalCount === 0 && desktopTotalCount === 0) || 
                 (selectedDevice === 'mobile' && templates.length === 0) || 
                 (selectedDevice === 'desktop' && templates.length === 0) ? (
              <div className="text-center py-16 rounded-xl border-2 border-dashed border-slate-200">
                <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="font-medium text-slate-800 mb-2">이 테마의 큐브가 없습니다</p>
                <p className="text-slate-600">다른 테마를 선택해보세요</p>
              </div>
            ) : (
              <div className="space-y-8">
                {selectedDevice === 'all' ? (
                  <>
                    {/* 모바일 템플릿 섹션 */}
                    {mobileTemplates.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                                </svg>
                                <h4 className="text-lg font-bold text-slate-800">모바일 템플릿</h4>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                                  {mobileTotalCount}개
                                </span>
                              </div>
                              
                              {/* 모바일 템플릿 페이지네이션 화살표 */}
                              {mobileTotalPages > 1 && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handlePageChange('mobile', Math.max(1, mobileCurrentPage - 1))}
                                    disabled={mobileCurrentPage === 1}
                                    className={`p-2 rounded-lg transition-all duration-300 ${
                                      mobileCurrentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm'
                                    }`}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                  </button>
                                  
                                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                                    {mobileCurrentPage} / {mobileTotalPages}
                                  </span>
                                  
                                  <button
                                    onClick={() => handlePageChange('mobile', Math.min(mobileTotalPages, mobileCurrentPage + 1))}
                                    disabled={mobileCurrentPage === mobileTotalPages}
                                    className={`p-2 rounded-lg transition-all duration-300 ${
                                      mobileCurrentPage === mobileTotalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm'
                                    }`}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {mobileTemplates.map((template) => (
                                <div
                                  key={template.id}
                                  onClick={() => handleCreateFromTemplate(template)}
                                  className="group cursor-pointer bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
                                >
                                  <div className="p-4">
                                    {/* 템플릿 캔버스 미리보기 */}
                                    <div className={`relative rounded-lg overflow-hidden mb-4 ${
                                      template.editingMode === 'mobile' 
                                        ? 'aspect-[9/16]' // 모바일: 9:16 비율 (세로로 긴 화면)
                                        : 'aspect-video'   // 데스크톱: 16:9 비율
                                    }`}>
                                      <TemplateCanvasPreview 
                                        template={template} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    
                                    <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                                      {template.name}
                                    </h4>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-blue-600 font-medium">
                                          {template.category}
                                        </span>                                        
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 구분선 */}
                        {mobileTemplates.length > 0 && desktopTemplates.length > 0 && (
                          <div className="flex items-center gap-4 py-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                              <span className="text-sm font-medium text-slate-600">데스크톱 템플릿</span>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                          </div>
                        )}

                        {/* 데스크톱 템플릿 섹션 */}
                        {desktopTemplates.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <h4 className="text-lg font-bold text-slate-800">데스크톱 템플릿</h4>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                  {desktopTotalCount}개
                                </span>
                              </div>
                              
                              {/* 데스크톱 템플릿 페이지네이션 화살표 */}
                              {desktopTotalPages > 1 && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handlePageChange('desktop', Math.max(1, desktopCurrentPage - 1))}
                                    disabled={desktopCurrentPage === 1}
                                    className={`p-2 rounded-lg transition-all duration-300 ${
                                      desktopCurrentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200 shadow-sm'
                                    }`}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                  </button>
                                  
                                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                                    {desktopCurrentPage} / {desktopTotalPages}
                                  </span>
                                  
                                  <button
                                    onClick={() => handlePageChange('desktop', Math.min(desktopTotalPages, desktopCurrentPage + 1))}
                                    disabled={desktopCurrentPage === desktopTotalPages}
                                    className={`p-2 rounded-lg transition-all duration-300 ${
                                      desktopCurrentPage === desktopTotalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200 shadow-sm'
                                    }`}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {desktopTemplates.map((template) => (
                                <div
                                  key={template.id}
                                  onClick={() => handleCreateFromTemplate(template)}
                                  className="group cursor-pointer bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
                                >
                                  <div className="p-4">
                                    {/* 템플릿 캔버스 미리보기 */}
                                    <div className={`relative rounded-lg overflow-hidden mb-4 ${
                                      template.editingMode === 'mobile' 
                                        ? 'aspect-[9/16]' // 모바일: 9:16 비율 (세로로 긴 화면)
                                        : 'aspect-video'   // 데스크톱: 16:9 비율
                                    }`}>
                                      <TemplateCanvasPreview 
                                        template={template} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    
                                    <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                                      {template.name}
                                    </h4>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-blue-600 font-medium">
                                          {template.category}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      // 특정 기기 선택 시 페이지네이션 포함
                      <div>
                        {/* 헤더와 페이지네이션 */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            {selectedDevice === 'mobile' ? (
                              <>
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                                </svg>
                                <h4 className="text-lg font-bold text-slate-800">모바일 템플릿</h4>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                                  {mobileTotalCount}개
                                </span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <h4 className="text-lg font-bold text-slate-800">데스크톱 템플릿</h4>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                  {desktopTotalCount}개
                                </span>
                              </>
                            )}
                          </div>
                          
                          {/* 페이지네이션 화살표 */}
                          {((selectedDevice === 'mobile' && mobileTotalPages > 1) || 
                            (selectedDevice === 'desktop' && desktopTotalPages > 1)) && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (selectedDevice === 'mobile') {
                                    handlePageChange('mobile', Math.max(1, mobileCurrentPage - 1));
                                  } else {
                                    handlePageChange('desktop', Math.max(1, desktopCurrentPage - 1));
                                  }
                                }}
                                disabled={
                                  (selectedDevice === 'mobile' && mobileCurrentPage === 1) ||
                                  (selectedDevice === 'desktop' && desktopCurrentPage === 1)
                                }
                                className={`p-2 rounded-lg transition-all duration-300 ${
                                  (selectedDevice === 'mobile' && mobileCurrentPage === 1) ||
                                  (selectedDevice === 'desktop' && desktopCurrentPage === 1)
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : `bg-white text-gray-700 hover:bg-${selectedDevice === 'mobile' ? 'blue' : 'green'}-50 hover:text-${selectedDevice === 'mobile' ? 'blue' : 'green'}-600 border border-gray-200 shadow-sm`
                                }`}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              
                              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                                {selectedDevice === 'mobile' ? 
                                  `${mobileCurrentPage} / ${mobileTotalPages}` : 
                                  `${desktopCurrentPage} / ${desktopTotalPages}`
                                }
                              </span>
                              
                              <button
                                onClick={() => {
                                  if (selectedDevice === 'mobile') {
                                    handlePageChange('mobile', Math.min(mobileTotalPages, mobileCurrentPage + 1));
                                  } else {
                                    handlePageChange('desktop', Math.min(desktopTotalPages, desktopCurrentPage + 1));
                                  }
                                }}
                                disabled={
                                  (selectedDevice === 'mobile' && mobileCurrentPage === mobileTotalPages) ||
                                  (selectedDevice === 'desktop' && desktopCurrentPage === desktopTotalPages)
                                }
                                className={`p-2 rounded-lg transition-all duration-300 ${
                                  (selectedDevice === 'mobile' && mobileCurrentPage === mobileTotalPages) ||
                                  (selectedDevice === 'desktop' && desktopCurrentPage === desktopTotalPages)
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : `bg-white text-gray-700 hover:bg-${selectedDevice === 'mobile' ? 'blue' : 'green'}-50 hover:text-${selectedDevice === 'mobile' ? 'blue' : 'green'}-600 border border-gray-200 shadow-sm`
                                }`}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {templates.map((template) => (
                          <div
                            key={template.id}
                            onClick={() => handleCreateFromTemplate(template)}
                            className="group cursor-pointer bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
                          >
                            <div className="p-4">
                              {/* 템플릿 캔버스 미리보기 */}
                              <div className={`relative rounded-lg overflow-hidden mb-4 ${
                                template.editingMode === 'mobile' 
                                  ? 'aspect-[9/16]' // 모바일: 9:16 비율 (세로로 긴 화면)
                                  : 'aspect-video'   // 데스크톱: 16:9 비율
                              }`}>
                                <TemplateCanvasPreview 
                                  template={template} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                                {template.name}
                              </h4>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-blue-600 font-medium">
                                    {template.category}
                                  </span>
                                </div>
                                <span className="text-sm text-slate-500">
                                  {template.usageCount}회 사용
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        </div>
                      </div>
                    )}
              </div>
            )}
          </div>

        </div>

        {/* 빈 큐브로 시작하기 섹션 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 relative border border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-xl flex items-center justify-center transform rotate-45">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">빈 캔버스로 시작하기</h3>
              </div>
              <p className="text-slate-600 ml-15">자유롭게 나만의 이벤트 페이지를 만들어보세요</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 text-pink-600 hover:text-white bg-pink-50 hover:bg-pink-600 rounded-xl transition-all duration-300 font-medium flex items-center gap-2"
            >
              지금 만들기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
              </div>

        {/* 삭제 확인 모달 */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-pink-600"
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
                <span className="text-sm text-pink-600">
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
                  className="flex-1 px-4 py-3 text-white bg-pink-500 hover:bg-pink-600 rounded-xl font-medium transition-colors"
                >
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 참석 의사 전달 모달 */}
      {attendanceModal.isOpen && (
        <AttendanceSummary
          pageId={attendanceModal.pageId}
          onClose={closeAttendanceModal}
        />
      )}
    </div>
  );
}

export default DashboardPage;

