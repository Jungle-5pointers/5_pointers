/**
 * BooleanEditor - 체크박스 형태의 Boolean 값 편집 에디터
 * 
 * 기능:
 * - true/false 값을 체크박스로 토글
 * - 라벨과 함께 직관적인 UI 제공
 * - GridGallery의 모달 옵션 등에 사용
 * 
 * 사용 예시:
 * <BooleanEditor 
 *   value={true} 
 *   onChange={(value) => console.log(value)} 
 *   label="전체화면 보기" 
 * />
 */

import React from 'react';

function BooleanEditor({ value, onChange, label = "옵션" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8,
        cursor: 'pointer'
      }}
      onClick={() => onChange(!value)}
      >
        {/* 체크박스 */}
        <div style={{
          width: 18,
          height: 18,
          border: '2px solid #d1d5db',
          borderRadius: 4,
          backgroundColor: value ? '#3B4EFF' : 'transparent',
          borderColor: value ? '#3B4EFF' : '#d1d5db',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          flexShrink: 0
        }}>
          {value && (
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none"
              style={{ color: 'white' }}
            >
              <path 
                d="M10 3L4.5 8.5L2 6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        
        {/* 라벨 */}
        <span style={{ 
          fontSize: 13, 
          color: '#333', 
          fontWeight: 500,
          userSelect: 'none'
        }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default BooleanEditor;
