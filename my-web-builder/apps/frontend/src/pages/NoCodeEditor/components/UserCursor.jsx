import React from 'react';

// 사용자 커서 표시
function UserCursor({ x, y, color, nickname }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x, top: y,
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        background: color, border: '2px solid #fff', boxShadow: '0 1px 4px #0002'
      }} />
      <div style={{
        marginTop: 2, fontSize: 12, color: color, fontWeight: 'bold',
        background: '#fff', borderRadius: 4, padding: '2px 6px', boxShadow: '0 1px 4px #0001'
      }}>{nickname}</div>
    </div>
  );
}

export default UserCursor; 