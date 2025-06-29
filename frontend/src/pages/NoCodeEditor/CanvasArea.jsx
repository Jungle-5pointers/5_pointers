// frontend/src/pages/NoCodeEditor/CanvasArea.jsx

import React from 'react';

function CanvasArea({
  canvasRef,
  components,
  selectedId,
  users,
  nickname,
  onDrop, onDragOver,
  onClick, onMouseMove,
  onSelect,
  onUpdate,
  onDelete,
  CanvasComponent,
  UserCursor
}) {
  return (
    // 1) 래퍼(wrapper)
    <div
      style={{
        flex: 1,
        minHeight: '100vh',
        background: '#f0f1f5',        // 래퍼 배경
        padding: 16,                  // 캔버스와 패널 사이 여백
        overflow: 'auto',
      }}
    >
      {/* 2) 실제 캔버스 */}
      <div
        ref={canvasRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: '#fff',         // 캔버스 배경
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          borderRadius: '6px',
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={onClick}
        onMouseMove={onMouseMove}
      >
        {/* 캔버스 내 컴포넌트 렌더링 */}
        {components.map(comp => (
          <CanvasComponent
            key={comp.id}
            comp={comp}
            selected={selectedId === comp.id}
            onSelect={onSelect}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}

    
        {/* 실시간 커서 표시 */}
        {Object.entries(users).map(([nick, u]) =>
          nick !== nickname ? (
            <UserCursor
              key={nick}
              x={u.x}
              y={u.y}
              color={u.color}
              nickname={nick}
            />
          ) : null
        )}
      </div>
    </div>
  );
}

export default CanvasArea;