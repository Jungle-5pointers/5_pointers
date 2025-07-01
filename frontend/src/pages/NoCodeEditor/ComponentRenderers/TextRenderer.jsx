import React, { useState, useRef, useEffect } from 'react';
import { getResponsiveValue, getResponsiveScale } from '../utils/editorUtils';

function TextRenderer({ comp, isEditor = false, viewport = 'desktop' }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comp.props.text);
  const inputRef = useRef();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (isEditor) {
      setEditing(true);
      setEditValue(comp.props.text);
    }
  };

  const handleBlur = () => {
    setEditing(false);
    if (editValue !== comp.props.text) {
      alert('텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditing(false);
      if (editValue !== comp.props.text) {
        alert('텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
      }
    }
  };

  // 반응형 스케일링 적용
  const responsiveFontSize = getResponsiveValue(comp.props.fontSize || 20, viewport, 'fontSize');

  if (editing && isEditor) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-32 border-2 border-blue-500 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        style={{ fontSize: responsiveFontSize }}
      />
    );
  }

  return (
    <div 
      className={`${isEditor ? 'w-auto h-auto min-w-[80px] min-h-[40px]' : 'w-full h-full'} flex items-center justify-center transition-all duration-200 hover:opacity-80 ${
        comp.props.bold ? 'font-bold' : 'font-normal'
      } ${
        comp.props.italic ? 'italic' : 'not-italic'
      } ${
        comp.props.underline ? 'underline' : 'no-underline'
      }`}
      style={{
        color: comp.props.color, 
        fontSize: responsiveFontSize
      }}
      onDoubleClick={handleDoubleClick}
    >
      {comp.props.text}
    </div>
  );
}

export default TextRenderer; 