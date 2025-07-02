import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function randomId() {
  return Math.random().toString(36).substring(2, 10);
}

function DashboardPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [drafts] = useState([
    { id: 'draft1', title: 'Wedding Invitation (Draft)' },
    { id: 'draft2', title: 'Birthday Party (Draft)' },
  ]);
  const [published] = useState([
    { id: 'pub1', title: 'My Portfolio Site' },
  ]);
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'wedding', label: '웨딩' },
    { value: 'events', label: '이벤트' },
    { value: 'portfolio', label: '포트폴리오' }
  ];

  // 템플릿 목록 조회
  const fetchTemplates = async (category = 'all') => {
    try {
      setLoading(true);
      const url = category === 'all' 
        ? `${API_BASE_URL}/templates`
        : `${API_BASE_URL}/templates?category=${category}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('템플릿 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(selectedCategory);
  }, [selectedCategory]);

  // 템플릿으로 페이지 생성 (캔버스와 동일한 API 사용)
  const handleCreateFromTemplate = async (templateId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`http://localhost:3000/templates/${templateId}/create-page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Template Page ${Date.now()}`,
          subdomain: `template-${Date.now()}`
        })
      });

      if (response.ok) {
        const pageData = await response.json();
        console.log('템플릿 API 응답:', pageData);
        
        // 템플릿 컴포넌트들을 에디터로 전달
        if (pageData.content) {
          const newRoomId = randomId();
          navigate(`/editor/${newRoomId}`, { 
            state: { templateComponents: pageData.content } 
          });
        } else {
          alert('템플릿에 컴포넌트 데이터가 없습니다.');
        }
      } else {
        alert('템플릿 로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
      alert('템플릿 로드에 실패했습니다.');
    }
  };

  const handleCreateNew = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'exists' : 'missing');
      if (token) console.log('Token preview:', token.substring(0, 20) + '...');
      
      const subdomain = randomId();
              const response = await fetch(`${API_BASE_URL}/users/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subdomain, title: 'Untitled' })
      });
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response:', responseText);
      
      if (response.ok) {
        const page = JSON.parse(responseText);
        navigate(`/editor/${page.id}`);
      } else {
        console.error('API Error:', response.status, responseText);
      }
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-200/30">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PAGE CUBE
              </h1>
              <p className="text-slate-600 font-medium mt-1">
                환영합니다, <span className="text-blue-600 font-semibold">{user.nickname}</span>님
              </p>
            </div>
            <button 
              onClick={onLogout}
              className="px-6 py-3 text-slate-600 hover:text-white bg-white/60 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 rounded-xl transition-all duration-300 backdrop-blur-sm border border-blue-200/50 font-medium shadow-sm hover:shadow-md"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 템플릿 섹션 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-blue-200/30">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  새로운 페이지 만들기
                </h3>
                <p className="text-slate-600 font-medium">템플릿을 선택하거나 빈 페이지로 시작하세요</p>
              </div>
            </div>
            
            {/* 카테고리 필터 */}
            <div className="flex gap-3">
              {categories.map(category => (
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
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
              <p className="text-slate-500 mt-4 font-medium">템플릿 로딩 중...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex gap-6 pb-4" style={{ minWidth: 'max-content' }}>
                {/* 빈 페이지 시작하기 카드 (첫 번째) */}
                <div 
                  onClick={handleCreateNew}
                  className="cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl p-6 border-2 border-dashed border-blue-300 hover:border-blue-400 min-w-[280px] transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-blue-700 text-lg mb-2">
                      빈 페이지부터 시작하기
                    </h4>
                    <p className="text-blue-600 text-sm font-medium">
                      자유롭게 디자인하세요
                    </p>
                  </div>
                </div>

                {/* 템플릿 카드들 */}
                {templates.map(template => (
                  <div 
                    key={template.id}
                    onClick={() => handleCreateFromTemplate(template.id)}
                    className="group cursor-pointer bg-white hover:bg-blue-50/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg border border-slate-200 hover:border-blue-300 min-w-[280px]"
                  >
                    {template.thumbnail_url ? (
                      <img 
                        src={template.thumbnail_url} 
                        alt={template.name}
                        className="w-full h-40 object-cover rounded-lg mb-4 group-hover:scale-102 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-4 flex items-center justify-center group-hover:scale-102 transition-transform duration-300">
                        <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    )}
                    <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                        {template.category}
                      </span>
                      <span className="text-sm text-slate-500">
                        {template.usageCount}회 사용
                      </span>
                    </div>
                  </div>
                ))}
                
                {templates.length === 0 && !loading && (
                  <div className="col-span-full text-center py-12 text-slate-500 min-w-[400px]">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="font-medium">선택한 카테고리에 템플릿이 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Drafts Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-blue-200/30">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">임시 저장</h3>
                <span className="ml-2 px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                  {drafts.length}개
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {drafts.map(draft => (
                <div 
                  key={draft.id} 
                  className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 rounded-lg cursor-pointer transition-all duration-300 group hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-800 font-medium">{draft.title}</span>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
              {drafts.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">배포된 페이지</h3>
                <span className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                  {published.length}개
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {published.map(pub => (
                <div 
                  key={pub.id} 
                  className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200 rounded-lg cursor-pointer transition-all duration-300 group hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-800 font-medium">{pub.title}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-emerald-700 bg-emerald-200 px-2 py-1 rounded-full font-medium">Live</span>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
              {published.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <p className="font-medium">배포된 페이지가 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;