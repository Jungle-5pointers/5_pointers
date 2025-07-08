import React, { useEffect } from 'react';
import { addUserColor } from '../../utils/userColors';

/**
 * 다른 사용자들의 실시간 커서를 렌더링하는 컴포넌트
 */
export function LiveCursors({ cursors = [], zoom = 100, viewport = 'desktop' }) {
  const scale = zoom / 100;
  
  // 디버깅 로그
  useEffect(() => {
    // console.log('LiveCursors 렌더링:', { 
    //   cursorsCount: cursors?.length || 0, 
    //   isArray: Array.isArray(cursors),
    //   cursors
    // });
  }, [cursors]);
  
  return (
    <>
      {Array.isArray(cursors) && cursors.length > 0 ? cursors.map((cursor, index) => {
        if (!cursor || !cursor.user) return null;
        
        // 사용자 정보에 고유 색상 추가
        const userWithColor = addUserColor(cursor.user);
        
        // 커서 좌표를 현재 줌 레벨에 맞게 변환
        const displayX = cursor.x * scale;
        const displayY = cursor.y * scale;
        
        return (
          <div
            key={`cursor-${cursor.user.id || index}-${index}`}
            style={{
              position: 'absolute',
              left: displayX,
              top: displayY,
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
              fill={userWithColor.color}
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
              backgroundColor: userWithColor.color,
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
            {userWithColor.name || '사용자'}
          </div>
        </div>
        );
      }) : null}
      
      <style>{`
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
export function CollaborativeSelections({ selections = [], components = [], zoom = 100, viewport = 'desktop', getComponentDimensions }) {
  const scale = zoom / 100;
  
  // 현재 뷰포트와 일치하는 선택 상태만 필터링
  const filteredSelections = selections.filter(selection => 
    selection.viewport === viewport
  );
  
  // 디버깅 로그
  useEffect(() => {
    // console.log('CollaborativeSelections 렌더링:', { 
    //   selectionsCount: selections?.length || 0, 
    //   filteredCount: filteredSelections?.length || 0,
    //   currentViewport: viewport,
    //   isArray: Array.isArray(selections),
    //   selections
    // });
  }, [selections, filteredSelections, viewport]);
  
  return (
    <>
      {Array.isArray(filteredSelections) && filteredSelections.length > 0 ? filteredSelections.map((selection, index) => 
        Array.isArray(selection.componentIds) ? selection.componentIds.map(componentId => {
          const component = components.find(c => c.id === componentId);
          if (!component) return null;

          // 사용자 정보에 고유 색상 추가
          const userWithColor = addUserColor(selection.user);

          // 컴포넌트의 실제 위치와 크기를 직접 가져오기 (단일 좌표계)
          const componentX = component.x || 0;
          const componentY = component.y || 0;
          const componentWidth = component.width || 150;
          const componentHeight = component.height || 50;
          
          // 컴포넌트 좌표와 크기를 스케일에 맞게 변환
          const scaledX = componentX * scale;
          const scaledY = componentY * scale;
          const scaledWidth = componentWidth * scale;
          const scaledHeight = componentHeight * scale;

          return (
            <div
              key={`selection-${selection.user?.id || index}-${componentId}`}
              style={{
                position: 'absolute',
                left: scaledX - 2,
                top: scaledY - 2,
                width: scaledWidth + 4,
                height: scaledHeight + 4,
                border: `2px solid ${userWithColor.color}`,
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
                  backgroundColor: userWithColor.color,
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {userWithColor.name || '사용자'}님이 편집 중
              </div>
            </div>
          );
        }) : null
      ) : null}
      
      <style>{`
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