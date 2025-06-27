import React from 'react';

function BackgroundColorEditor({ value, onChange, label = "Background" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* 배경색 미리보기 박스 */}
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              border: '1px solid #ddd',
              backgroundColor: value || '#3B4EFF',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          />
          {/* HTML 색상 선택기 */}
          <input
            type="color"
            value={value || '#3B4EFF'}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: 32,
              height: 24,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default BackgroundColorEditor;
