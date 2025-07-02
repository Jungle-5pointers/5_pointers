import React, { useState, useRef, useEffect } from 'react';

function LinkRenderer({ comp, isEditor = false }) {
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
      alert('링크 텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditing(false);
      if (editValue !== comp.props.text) {
        alert('링크 텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
      }
    }
  };

  if (editing && isEditor) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-32 border-2 border-blue-500 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        style={{ fontSize: comp.props.fontSize }}
      />
    );
  }

  return (
    <div 
      className={`${isEditor ? 'w-auto h-auto min-w-[80px] min-h-[40px]' : 'w-full h-full'} flex items-center justify-center underline cursor-pointer transition-all duration-200 hover:opacity-70 hover:scale-105 active:scale-95`}
      style={{
        color: comp.props.color, 
        fontSize: comp.props.fontSize
      }}
      onDoubleClick={handleDoubleClick}
    >
      {comp.props.text}
    </div>
  );
}

export default LinkRenderer; 