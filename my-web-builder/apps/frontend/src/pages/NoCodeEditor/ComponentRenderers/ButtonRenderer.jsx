import React from 'react';

/**
 * 버튼 컴포넌트 렌더러
 * 레이아웃 스타일은 상위 컴포넌트에서 관리
 */
const ButtonRenderer = ({ comp, isEditor }) => {
  const { props } = comp;

  // 내부 스타일만 적용
  const buttonStyle = {
    backgroundColor: props.backgroundColor || '#ffffff',
    color: props.textColor || '#000000',
    border: props.border || '1px solid #000000',
    borderRadius: props.borderRadius || '4px',
    padding: props.padding || '8px 16px',
    fontSize: props.fontSize || '16px',
    fontFamily: props.fontFamily || 'inherit',
    cursor: isEditor ? 'default' : 'pointer',
    width: '100%',
    textAlign: props.textAlign || 'center',
  };

  return (
    <button
      style={buttonStyle}
      onClick={isEditor ? undefined : props.onClick}
      disabled={isEditor}
    >
      {props.text || '버튼'}
    </button>
  );
};

export default ButtonRenderer;
