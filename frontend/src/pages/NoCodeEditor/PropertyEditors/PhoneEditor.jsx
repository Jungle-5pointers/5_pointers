import React from 'react';

function PhoneEditor({ 
  value1, 
  value2, 
  value3, 
  onChange1, 
  onChange2, 
  onChange3, 
  label = "전화번호",
  placeholder1 = "010",
  placeholder2 = "1234", 
  placeholder3 = "5678"
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ 
        display: 'block',
        fontSize: 13, 
        color: '#333', 
        fontWeight: 500,
        marginBottom: 6
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="text"
          placeholder={placeholder1}
          value={value1 || ''}
          onChange={(e) => onChange1(e.target.value)}
          style={{
            width: 60,
            padding: '8px 12px',
            fontSize: 14,
            border: '1px solid #ddd',
            borderRadius: 6,
            outline: 'none',
            textAlign: 'center',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
            background: '#fff'
          }}
          onFocus={(e) => e.target.style.borderColor = '#0066FF'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
        <span style={{ fontSize: 14, color: '#666' }}>-</span>
        <input
          type="text"
          placeholder={placeholder2}
          value={value2 || ''}
          onChange={(e) => onChange2(e.target.value)}
          style={{
            width: 80,
            padding: '8px 12px',
            fontSize: 14,
            border: '1px solid #ddd',
            borderRadius: 6,
            outline: 'none',
            textAlign: 'center',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
            background: '#fff'
          }}
          onFocus={(e) => e.target.style.borderColor = '#0066FF'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
        <span style={{ fontSize: 14, color: '#666' }}>-</span>
        <input
          type="text"
          placeholder={placeholder3}
          value={value3 || ''}
          onChange={(e) => onChange3(e.target.value)}
          style={{
            width: 80,
            padding: '8px 12px',
            fontSize: 14,
            border: '1px solid #ddd',
            borderRadius: 6,
            outline: 'none',
            textAlign: 'center',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
            background: '#fff'
          }}
          onFocus={(e) => e.target.style.borderColor = '#0066FF'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
      </div>
    </div>
  );
}

export default PhoneEditor; 