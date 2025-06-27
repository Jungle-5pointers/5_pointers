import React from 'react';

function ColorEditor({ value, onChange, label = "Color" }) {
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
          {/* 색상 미리보기 박스 */}
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              border: '1px solid #ddd',
              backgroundColor: value || '#000000',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          />
          {/* HTML 색상 선택기 */}
          <input
            type="color"
            value={value || '#000000'}
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

export default ColorEditor;
