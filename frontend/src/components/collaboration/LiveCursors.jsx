import React from 'react';

/**
 * 다른 사용자들의 실시간 커서를 렌더링하는 컴포넌트
 */
export function LiveCursors({ cursors }) {
  return (
    <>
      {cursors.map((cursor, index) => (
        <div
          key={`cursor-${cursor.user.id}-${index}`}
          style={{
            position: 'absolute',
            left: cursor.x,
            top: cursor.y,
            pointerEvents: 'none',
            zIndex: 9999,
            transform: 'translate(-2px, -2px)', // 커서 포인터 정확한 위치 조정
            transition: 'left 0.1s ease-out, top 0.1s ease-out', // 부드러운 움직임
          }}
        >
          {/* 커서 아이콘 */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              filter: `drop-shadow(0px 2px 4px rgba(0,0,0,0.2))`
            }}
          >
            <path
              d="M3 3L21 12L12 21L9 12L3 3Z"
              fill={cursor.user.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          
          {/* 사용자 이름표 */}
          <div
            style={{
              position: 'absolute',
              left: 16,
              top: -4,
              backgroundColor: cursor.user.color,
              color: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {cursor.user.name}
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

/**
 * 다른 사용자가 선택한 컴포넌트에 테두리를 표시하는 컴포넌트
 */
export function CollaborativeSelections({ selections, components }) {
  return (
    <>
      {selections.map((selection, index) => 
        selection.componentIds.map(componentId => {
          const component = components.find(c => c.id === componentId);
          if (!component) return null;

          return (
            <div
              key={`selection-${selection.user.id}-${componentId}`}
              style={{
                position: 'absolute',
                left: component.x - 2,
                top: component.y - 2,
                width: (component.width || 120) + 4,
                height: (component.height || 40) + 4,
                border: `2px solid ${selection.user.color}`,
                borderRadius: '4px',
                pointerEvents: 'none',
                zIndex: 8,
                animation: 'pulseSelection 2s infinite'
              }}
            >
              {/* 선택한 사용자 이름표 */}
              <div
                style={{
                  position: 'absolute',
                  top: -28,
                  left: 0,
                  backgroundColor: selection.user.color,
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {selection.user.name}님이 편집 중
              </div>
            </div>
          );
        })
      )}
      
      <style jsx>{`
        @keyframes pulseSelection {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
} 