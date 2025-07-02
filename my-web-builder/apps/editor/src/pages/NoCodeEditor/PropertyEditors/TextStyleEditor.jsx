import React from 'react';

function TextStyleEditor({ 
  label, 
  boldValue, 
  italicValue, 
  underlineValue,
  onBoldChange,
  onItalicChange,
  onUnderlineChange,
  currentFont = null
}) {
  const styleOptions = [
    {
      key: 'bold',
      label: '굵게',
      value: boldValue,
      onChange: onBoldChange,
      icon: 'B',
      style: { fontWeight: 'bold' },
      disabled: false
    },
    {
      key: 'italic',
      label: '기울임',
      value: italicValue,
      onChange: onItalicChange,
      icon: 'I',
      style: { fontStyle: 'italic' },
      disabled: false // 모든 폰트에서 기울임 지원
    },
    {
      key: 'underline',
      label: '밑줄',
      value: underlineValue,
      onChange: onUnderlineChange,
      icon: 'U',
      style: { textDecoration: 'underline' },
      disabled: false
    }
  ];

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
      
      {/* 스타일 토글 버튼들 */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '2px',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        border: '1px solid #e5e7eb'
      }}>
        {styleOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => option.onChange(!option.value)}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: option.value ? '#3b82f6' : 'transparent',
              color: option.value ? 'white' : '#6b7280',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              minHeight: '32px',
              ...option.style
            }}
            onMouseEnter={(e) => {
              if (!option.value) {
                e.target.style.backgroundColor = '#e5e7eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!option.value) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
            title={option.label}
          >
            {option.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TextStyleEditor;
