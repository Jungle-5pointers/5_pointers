import React from 'react';

function CommentEditor({ selectedComp, onUpdate }) {
  const handlePropChange = (propName, value) => {
    onUpdate({
      ...selectedComp,
      props: {
        ...selectedComp.props,
        [propName]: value
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 컴포넌트 정보 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        padding: '8px 12px',
        backgroundColor: '#f0f2f5',
        borderRadius: 6
      }}>
        <span style={{ fontSize: 16 }}>💬</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1d2129' }}>
            Comment
          </div>
          <div style={{ fontSize: 11, color: '#65676b' }}>
            {selectedComp.id}
          </div>
        </div>
      </div>

      <div>
        <label style={{
          display: 'block', fontSize: 13, fontWeight: 500,
          color: '#333', marginBottom: 8
        }}>
          제목
        </label>
        <input
          type="text"
          value={selectedComp.props.title || ''}
          onChange={(e) => handlePropChange('title', e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', border: '1px solid #ddd',
            borderRadius: 6, fontSize: 14, outline: 'none'
          }}
        />
      </div>
      
      <div>
        <label style={{
          display: 'block', fontSize: 13, fontWeight: 500,
          color: '#333', marginBottom: 8
        }}>
          댓글 입력 안내 문구
        </label>
        <input
          type="text"
          value={selectedComp.props.placeholder || ''}
          onChange={(e) => handlePropChange('placeholder', e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', border: '1px solid #ddd',
            borderRadius: 6, fontSize: 14, outline: 'none'
          }}
        />
      </div>
      
      <div>
        <label style={{
          display: 'block', fontSize: 13, fontWeight: 500,
          color: '#333', marginBottom: 8
        }}>
          배경색
        </label>
        <input
          type="color"
          value={selectedComp.props.backgroundColor || '#ffffff'}
          onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
          style={{
            width: '100%', height: 40, border: '1px solid #ddd',
            borderRadius: 6, cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
}

export default CommentEditor;