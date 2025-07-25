import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import ddukddakLogo from '../assets/page-cube-logo.png';

// 페이지 멤버 정보를 가져오는 함수
const fetchPageMembers = async (pageId, userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/users/pages/${pageId}/members?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('페이지 멤버 조회 실패:', error);
  }
  return [];
};
function DraftsPage({ user, onLogout }) {
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
  const [pageMembers, setPageMembers] = useState({});
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
          const firstIndex = arr.findIndex((p) => p.id === page.id);
          return firstIndex === index;
        });
        setMyPages(uniquePages);

        // 각 페이지의 멤버 정보 조회
        const membersData = {};
        for (const page of uniquePages) {
          const members = await fetchPageMembers(page.id, user.id);
          membersData[page.id] = members;
        }
        setPageMembers(membersData);
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
      // 제목 수정 실패 처리
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
  const draftPages = myPages.filter((page) => page.status === 'DRAFT');
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-pink-50 to-rose-50 sticky top-0"
        style={{ position: 'relative', zIndex: 30 }}
      >
        <div className="max-w-7xl mx-auto px-7 py-3">
          <div className="flex justify-between items-center">
            {/* 로고 섹션 */}
            <div className="flex items-center gap-6">
              <div
                className="relative group cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                <img 
                  src="/ddukddak-logo.png" 
                  style={{ height: '36px', objectFit: 'contain' }} 
                />
              </div>
            </div>
            {/* 우측 버튼 그룹 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-500 border border-violet-600 shadow-sm"></div>
                  <p className="text-slate-600 font-medium text-lg">
                    <span className="text-black font-semibold">{user.nickname}</span>님
                  </p>
              </div>
              {/* 배포된 페이지 버튼 */}
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
            <h2 className="text-5xl font-bold text-slate-800">임시 저장된 페이지</h2>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-1xl font-medium rounded-full">
              {draftPages.length}개
            </span>
          </div>
          <p className="text-slate-600 text-2xl">아직 완성되지 않은 페이지들을 관리하세요</p>
        </div>
        {/* 페이지 목록 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {pagesLoading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-600 font-medium">
                페이지를 불러오는 중...
              </p>
            </div>
          ) : draftPages.length === 0 ? (
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <p className="font-medium text-lg text-slate-800 mb-2">임시 저장된 페이지가 없습니다</p>
              <p className="text-slate-600 mb-4">새로운 페이지를 만들어보세요</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl font-medium hover:bg-slate-600 hover:text-white transition-colors"
              >
                대시보드로 돌아가기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftPages.map((page) => (
                <div
                  key={page.id}
                  className="bg-white border border-slate-300 rounded-xl p-6 hover:bg-blue-50 transition-all duration-300 group flex flex-col"
                  style={{ minHeight: '140px' }}
                >
                  <div className="flex items-start justify-between mb-4 flex-1">
                    <div className="flex-1">
                      {editingId === page.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => saveEditTitle(page.id)}
                          onKeyPress={(e) =>
                            e.key === 'Enter' && saveEditTitle(page.id)
                          }
                          className="w-full px-3 py-2 text-lg font-bold border border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white"
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
                          {page.title || '제목 없음'}
                        </h3>
                      )}

                      {/* 뷰포트 표시 */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          page.editingMode === 'mobile' 
                            ? 'bg-[#FF9696] text-white' 
                            : 'bg-[#9E9EE6] text-white'
                        }`}>
                          {page.editingMode === 'mobile' ? (
                            <>
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              모바일
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              데스크톱
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-slate-600">
                        마지막 수정:{' '}
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </p>
                      
                      {/* 멤버 정보 표시 */}
                      {pageMembers[page.id] && pageMembers[page.id].length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-slate-500">멤버:</span>
                          <div className="flex flex-wrap gap-1">
                            {pageMembers[page.id]
                              .slice(0, 3)
                              .map((member, index) => (
                                <span
                                  key={member.id}
                                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {member.nickname || member.email?.split('@')[0] || '알 수 없음'}
                                </span>
                              ))}
                            {pageMembers[page.id].length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{pageMembers[page.id].length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
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
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => {
                        navigate(`/editor/${page.id}`);
                      }}
                      className="w-full px-4 py-2 bg-slate-400 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
                    >
                      편집하기

                    </button>
                  </div>
                </div>
              ))}
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
    </div>
  );
}
export default DraftsPage;
