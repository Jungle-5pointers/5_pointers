import React from 'react';

function TextAlignEditor({ label, value, onChange }) {
  const alignOptions = [
    { 
      value: 'left', 
      label: '왼쪽 정렬', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="2" y="3" width="8" height="1.5" rx="0.5"/>
          <rect x="2" y="6" width="12" height="1.5" rx="0.5"/>
          <rect x="2" y="9" width="6" height="1.5" rx="0.5"/>
          <rect x="2" y="12" width="10" height="1.5" rx="0.5"/>
        </svg>
      )
    },
    { 
      value: 'center', 
      label: '가운데 정렬', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="4" y="3" width="8" height="1.5" rx="0.5"/>
          <rect x="2" y="6" width="12" height="1.5" rx="0.5"/>
          <rect x="5" y="9" width="6" height="1.5" rx="0.5"/>
          <rect x="3" y="12" width="10" height="1.5" rx="0.5"/>
        </svg>
      )
    },
    { 
      value: 'right', 
      label: '오른쪽 정렬', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="6" y="3" width="8" height="1.5" rx="0.5"/>
          <rect x="2" y="6" width="12" height="1.5" rx="0.5"/>
          <rect x="8" y="9" width="6" height="1.5" rx="0.5"/>
          <rect x="4" y="12" width="10" height="1.5" rx="0.5"/>
        </svg>
      )
    }
  ];

  const currentAlign = value || 'center';

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
      
      {/* 정렬 버튼들 */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '2px',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        border: '1px solid #e5e7eb'
      }}>
        {alignOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: currentAlign === option.value ? '#3b82f6' : 'transparent',
              color: currentAlign === option.value ? 'white' : '#6b7280',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              minHeight: '32px'
            }}
            onMouseEnter={(e) => {
              if (currentAlign !== option.value) {
                e.target.style.backgroundColor = '#e5e7eb';
              }
            }}
            onMouseLeave={(e) => {
              if (currentAlign !== option.value) {
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

export default TextAlignEditor;
