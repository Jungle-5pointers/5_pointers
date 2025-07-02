import React from 'react';

function TemplateModal({
  isOpen,
  onClose,
  templateData,
  setTemplateData,
  onSave
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        width: 400,
        maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 600 }}>
          템플릿으로 저장
        </h3>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
            템플릿 이름
          </label>
          <input
            type="text"
            value={templateData.name}
            onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
            placeholder="템플릿 이름을 입력하세요"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 14,
              outline: 'none'
            }}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
            카테고리
          </label>
          <select
            value={templateData.category}
            onChange={(e) => setTemplateData({...templateData, category: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 14,
              outline: 'none'
            }}
          >
            <option value="wedding">웨딩</option>
            <option value="events">이벤트</option>
            <option value="portfolio">포트폴리오</option>
          </select>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
            태그 (쉼표로 구분)
          </label>
          <input
            type="text"
            value={templateData.tags}
            onChange={(e) => setTemplateData({...templateData, tags: e.target.value})}
            placeholder="예: 결혼식, 초대장, 예쁜"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 14,
              outline: 'none'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#f8f9fa',
              color: '#6c757d',
              border: '1px solid #dee2e6',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            취소
          </button>
          <button
            onClick={onSave}
            disabled={!templateData.name}
            style={{
              padding: '8px 16px',
              background: templateData.name ? '#28a745' : '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              cursor: templateData.name ? 'pointer' : 'not-allowed'
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateModal; 