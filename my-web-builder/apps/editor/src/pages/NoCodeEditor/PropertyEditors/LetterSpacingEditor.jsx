import React from 'react';

function LetterSpacingEditor({ label, value, onChange, min = -2, max = 10, step = 0.1, suffix = 'px' }) {
  const currentValue = value || 0;

  const handleInputChange = (e) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(max, newValue)));
    }
  };

  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

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
      
      {/* 입력 필드와 슬라이더 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px'
      }}>
        <input
          type="number"
          value={currentValue}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          style={{
            width: '60px',
            padding: '4px 6px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px',
            textAlign: 'center',
            outline: 'none'
          }}
        />
        <input
          type="range"
          value={currentValue}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          style={{
            flex: 1,
            height: '4px',
            background: '#e5e7eb',
            borderRadius: '2px',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
        <span style={{ 
          fontSize: '11px', 
          color: '#6b7280',
          minWidth: '30px'
        }}>
          {currentValue.toFixed(1)}{suffix}
        </span>
      </div>
    </div>
  );
}

export default LetterSpacingEditor;
