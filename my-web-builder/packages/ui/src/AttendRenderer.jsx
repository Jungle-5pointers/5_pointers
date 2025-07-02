import React from 'react';

function AttendRenderer({ comp, isEditor = false }) {
  // 컴포넌트 크기를 인라인 스타일로 적용
  const containerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    padding: '24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '200px'
  };

  return (
    <div style={containerStyle}>
      <div style={{
        color: '#9ca3af',
        fontSize: '18px',
        fontWeight: '500',
        marginBottom: '16px'
      }}>
        {comp.props.title || '참석 의사 전달'}
      </div>
      <div style={{
        color: '#374151',
        fontSize: '16px',
        lineHeight: '1.6',
        marginBottom: '20px',
        whiteSpace: 'pre-line',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {comp.props.description || (
          <>
            축하의 마음으로 참석해 주실<br />
            모든 분을 정중히 모시고자 하오니,<br />
            참석 여부를 알려주시면 감사하겠습니다.
          </>
        )}
      </div>
      <button
        style={{
          width: '100%',
          padding: '12px 16px',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          letterSpacing: '0.5px',
          background: comp.props.buttonColor || '#aeb8fa',
        }}
        onClick={e => {
          e.stopPropagation();
          if (isEditor) {
            alert('참석 기능은 배포 모드에서 사용 가능합니다.');
          }
        }}
      >
        {comp.props.buttonText || '전달하기'}
      </button>
    </div>
  );
}

export default AttendRenderer; 