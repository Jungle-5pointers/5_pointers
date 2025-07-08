import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PreviewRenderer from './NoCodeEditor/PreviewRenderer';
import './NoCodeEditor/styles/preview.css';
import { API_BASE_URL } from '../config';

function Dashboard() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);

  // 빈 페이지 생성
  const handleCreateNewPage = () => {
    const newId = Math.random().toString(36).slice(2, 10);
    navigate(`/editor/${newId}`);
  };

  // API에서 받은 템플릿 데이터로 페이지 생성
  const handleCreateWithTemplate = (templateData) => {
    const newId = Math.random().toString(36).slice(2, 10);
    const templateParam = encodeURIComponent(JSON.stringify(templateData));
    navigate(`/editor/${newId}?template=${templateParam}`);
  };
  
  // 템플릿 목록 가져오기
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // 실제 API 호출
        const response = await fetch(`${API_BASE_URL}/templates`);
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        } else {
          console.log('템플릿 API 없음, 목 데이터 사용');
          // API가 없으면 목 데이터 사용
          const mockTemplates = [{
            id: '1',
            title: '웨딩 인비테이션',
            description: '아름다운 웨딩 인비테이션 템플릿',
            content: [
              {x: 200, y: 50, id: '1', type: 'text', props: {text: '우리의 결혼식에 초대합니다', fontSize: 24, color: '#2d3748'}},
              {x: 150, y: 150, id: '2', type: 'button', props: {text: '참석 의사 전달', bg: '#e53e3e', color: '#fff'}},
              {x: 100, y: 250, id: '3', type: 'text', props: {text: '2024년 12월 25일 오후 2시', fontSize: 16, color: '#4a5568'}}
            ]
          }, {
            id: '2',
            title: '비즈니스 랜딩',
            description: '전문적인 비즈니스 랜딩 페이지',
            content: [
              {x: 100, y: 80, id: '1', type: 'text', props: {text: '비즈니스 솔루션', fontSize: 28, color: '#1a202c'}},
              {x: 120, y: 180, id: '2', type: 'button', props: {text: '무료 체험 시작', bg: '#3182ce', color: '#fff'}},
              {x: 80, y: 280, id: '3', type: 'text', props: {text: '전문가와 상담하세요', fontSize: 14, color: '#718096'}}
            ]
          }];
          setTemplates(mockTemplates);
        }
      } catch (error) {
        console.error('템플릿 로딩 실패:', error);
        // 에러 시 목 데이터 사용
        const mockTemplates = [{
          id: '1',
          title: '기본 템플릿',
          description: '간단한 시작 템플릿',
          content: [
            {x: 100, y: 100, id: '1', type: 'button', props: {text: '클릭하세요', bg: '#3B4EFF', color: '#fff'}},
            {x: 100, y: 200, id: '2', type: 'text', props: {text: '템플릿 텍스트', fontSize: 18}}
          ]
        }];
        setTemplates(mockTemplates);
      }
    };
    fetchTemplates();
  }, []);
  
  // 템플릿 선택
  const handleSelectTemplate = (template) => {
    console.log('선택된 템플릿:', template);
    handleCreateWithTemplate(template);
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      background: '#f5f6fa', gap: 20
    }}>
      <h1 style={{ fontSize: 32, color: '#333', marginBottom: 40 }}>페이지레고</h1>
      
      <button
        onClick={handleCreateNewPage}
        style={{
          fontSize: 18, padding: '16px 32px',
          background: '#3B4EFF', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer',
          marginBottom: 32
        }}
      >
        빈 페이지 만들기
      </button>
      
      {/* 템플릿 섹션 */}
      {templates.length > 0 && (
        <div style={{ width: '100%', maxWidth: '1200px', padding: '0 20px' }}>
          <h2 style={{ fontSize: 24, color: '#333', marginBottom: 20, textAlign: 'center' }}>템플릿으로 시작하기</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {templates.map(template => (
              <div 
                key={template.id} 
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onClick={() => handleSelectTemplate(template)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
              >
                {/* 미리보기 영역 */}
                <div style={{
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  aspectRatio: '16/9',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ 
                    transform: 'scale(0.2)', 
                    transformOrigin: 'top left', 
                    width: '500%', 
                    height: '500%',
                    pointerEvents: 'none',
                    overflow: 'hidden'
                  }}>
                    <div style={{ width: '1920px', height: '1080px', position: 'relative' }}>
                      <PreviewRenderer pageContent={template.content} forcedViewport="desktop" />
                    </div>
                  </div>
                </div>
                
                {/* 템플릿 정보 */}
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '8px',
                  margin: 0
                }}>
                  {template.title}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280',
                  margin: '8px 0 0 0',
                  lineHeight: '1.4'
                }}>
                  {template.description || '이 템플릿으로 빠르게 시작하세요'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
