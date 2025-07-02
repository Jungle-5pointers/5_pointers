import React, { useState, useRef, useEffect } from 'react';

function NumberEditor({ 
  value, 
  onChange, 
  label = "Number", 
  min = 0, 
  max = 1000, 
  suffix = "",
  presets = null,
  step = 1
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // 폰트 크기용 기본 프리셋
  const defaultFontPresets = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];
  const fontSizePresets = presets || (suffix === 'px' && label.includes('크기') ? defaultFontPresets : null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentValue = value || min;

  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(max, newValue)));
    }
  };

  const handleSliderChange = (e) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
  };

  const handlePresetSelect = (presetValue) => {
    onChange(presetValue);
    setIsDropdownOpen(false);
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
      
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        {/* 통합 버튼 */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            outline: 'none'
          }}
          onMouseEnter={(e) => e.target.style.borderColor = '#9ca3af'}
          onMouseLeave={(e) => e.target.style.borderColor = '#d1d5db'}
        >
          <span style={{ color: '#374151', fontWeight: '500' }}>
            {currentValue}{suffix}
          </span>
          <span style={{ 
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            ▼
          </span>
        </button>

        {/* 드롭다운 메뉴 */}
        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 1000,
            padding: '8px'
          }}>
            {/* 슬라이더 섹션 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '6px'
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
                  {currentValue}{suffix}
                </span>
              </div>
            </div>

            {/* 프리셋 섹션 (폰트 크기인 경우에만) */}
            {fontSizePresets && (
              <>
                <div style={{
                  height: '1px',
                  backgroundColor: '#e5e7eb',
                  margin: '8px 0'
                }} />
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  marginBottom: '6px',
                  fontWeight: '500'
                }}>
                  빠른 선택
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '4px'
                }}>
                  {fontSizePresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handlePresetSelect(preset)}
                      style={{
                        padding: '6px 4px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '3px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        backgroundColor: currentValue === preset ? '#3b82f6' : 'white',
                        color: currentValue === preset ? 'white' : '#374151',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (currentValue !== preset) {
                          e.target.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentValue !== preset) {
                          e.target.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NumberEditor;
