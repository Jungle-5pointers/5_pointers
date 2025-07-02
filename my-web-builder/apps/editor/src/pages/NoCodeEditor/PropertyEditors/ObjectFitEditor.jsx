import React from 'react';

function ObjectFitEditor({ label, value, onChange }) {
  const fitOptions = [
    { 
      value: 'cover', 
      label: '덮어쓰기',
      description: '비율 유지하며 영역 채움',
      icon: '🔲'
    },
    { 
      value: 'none', 
      label: '원본',
      description: '원본 크기 유지',
      icon: '📏'
    }
  ];

  const currentFit = value || 'cover';

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '6px', 
        fontSize: '12px', 
        fontWeight: '500',
        color: '#374151'
      }}>
        {label}
      </label>
      
      {/* 맞춤 방식 버튼들 */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '2px',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        border: '1px solid #e5e7eb'
      }}>
        {fitOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              flex: 1,
              padding: '8px 6px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              backgroundColor: currentFit === option.value ? '#3b82f6' : 'transparent',
              color: currentFit === option.value ? 'white' : '#6b7280',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              outline: 'none',
              minHeight: '50px'
            }}
            onMouseEnter={(e) => {
              if (currentFit !== option.value) {
                e.target.style.backgroundColor = '#e5e7eb';
              }
            }}
            onMouseLeave={(e) => {
              if (currentFit !== option.value) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
            title={option.description}
          >
            <span style={{ fontSize: '14px' }}>{option.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: '500' }}>
              {option.label}
            </span>
          </button>
        ))}
      </div>
      
      {/* 현재 선택된 옵션 설명 */}
      <div style={{
        marginTop: '4px',
        fontSize: '11px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        {fitOptions.find(opt => opt.value === currentFit)?.description}
      </div>
    </div>
  );
}

export default ObjectFitEditor;
