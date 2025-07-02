import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

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
    // 실제 API 호출 (예시)
    const fetchTemplates = async () => {
      try {
        // 여기에 실제 API 호출 로직 추가
        // const response = await fetch('/api/templates');
        // const data = await response.json();
        
        // 임시 데이터
        const mockTemplates = [{
          id: '1',
          title: 'Sample Template',
          content: [
            {x: 100, y: 100, id: '1', type: 'button', props: {text: '클릭하세요', bg: '#3B4EFF', color: '#fff'}},
            {x: 100, y: 200, id: '2', type: 'text', props: {text: '템플릿 텍스트', fontSize: 18}}
          ]
        }];
        setTemplates(mockTemplates);
      } catch (error) {
        console.error('템플릿 로딩 실패:', error);
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
          marginBottom: 12
        }}
      >
        빈 페이지 만들기
      </button>
      

    </div>
  );
}

export default Dashboard;
