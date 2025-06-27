import React from 'react';

function FontSizeEditor({ 
  value, 
  onChange, 
  label = "Font Size", 
  min = 8, 
  max = 72, 
  suffix = "px" 
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 6
      }}>
        <label style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>
          {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="number"
            value={value || min}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            style={{
              width: 60,
              padding: '4px 8px',
              fontSize: 12,
              textAlign: 'right',
              border: '1px solid #ddd',
              borderRadius: 4,
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0066FF'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
          <span style={{ fontSize: 11, color: '#666' }}>{suffix}</span>
        </div>
      </div>
    </div>
  );
}

export default FontSizeEditor;
