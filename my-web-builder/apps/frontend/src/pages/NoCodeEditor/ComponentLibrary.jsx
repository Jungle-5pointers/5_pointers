import React, { useState, useRef } from 'react';
import { ComponentList } from '../components/definitions';

// 모듈화된 컴포넌트들
import SearchBar from './ComponentLibrary/components/SearchBar';
import ComponentGrid from './ComponentLibrary/components/ComponentGrid';

function ComponentLibrary({
  onDragStart,
  components,
  roomId,
  isOpen = true,
  onToggle,
  isReady,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [libraryWidth, setLibraryWidth] = useState(320); // 기본 너비
  const resizeRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target === resizeRef.current) {
      setIsResizing(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 600) {
        // 최소 200px, 최대 600px
        setLibraryWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  if (!isOpen) {
    return (
      <div style={{ position: 'relative' }}>
        {/* 라이브러리가 닫혔을 때 표시되는 토글 버튼 */}
        <button
          onClick={onToggle}
          style={{
            position: 'absolute',
            left: '0',
            top: '10px',
            width: '28px',
            height: '48px',
            backgroundColor: '#ffffff',
            border: '2px solid var(--color-primary-200)',
            borderLeft: 'none',
            borderTopRightRadius: '8px',
            borderBottomRightRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'none',
            zIndex: 5,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--color-primary-50)';
            e.target.style.borderColor = 'var(--color-primary-500)';
            e.target.style.boxShadow = 'none';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#ffffff';
            e.target.style.borderColor = 'var(--color-primary-200)';
            e.target.style.boxShadow = 'none';
          }}
          title="컴포넌트 라이브러리 열기"
        >
          <span style={{ fontSize: '14px', color: 'var(--color-primary-400)' }}>
            ▶
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside
      className="bg-white transition-all duration-300 ease-in-out border-r border-gray-200 flex flex-col"
      style={{
        width: `${libraryWidth}px`,
        minWidth: '200px',
        maxWidth: '600px',
        position: 'relative',
      }}
    >
      {/* 연결 안 됐을 때 오버레이 */}
      {!isReady && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
            <p className="text-white font-semibold">에디터 연결 중...</p>
          </div>
        </div>
      )}

      {/* 고정 검색바 */}
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* 스크롤 가능한 컴포넌트 그리드 */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-primary-100) var(--color-primary-50)',
        }}
      >
        <ComponentGrid
          components={ComponentList}
          searchTerm={searchTerm}
          onDragStart={onDragStart}
        />
      </div>

      {/* 배포 섹션 제거됨 */}

      {/* 토글 버튼 - 검색바 높이에 맞춰 위치 */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          right: '-28px',
          top: '10px',
          width: '28px',
          height: '48px',
          backgroundColor: '#ffffff',
          border: '2px solid var(--color-primary-200)',
          borderLeft: 'none',
          borderTopRightRadius: '8px',
          borderBottomRightRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'none',
          zIndex: 5,
          transition: 'all 0.2s ease',
          color: 'var(--color-primary-500)',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--color-primary-50)';
          e.target.style.borderColor = 'var(--color-primary-500)';
          e.target.style.boxShadow = 'none';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.borderColor = 'var(--color-primary-200)';
          e.target.style.boxShadow = 'none';
        }}
        title="컴포넌트 라이브러리 토글"
      >
        <span style={{ fontSize: '14px', color: 'var(--color-primary-400)' }}>
          ◀
        </span>
      </button>

      {/* 리사이즈 핸들 */}
      <div
        ref={resizeRef}
        style={{
          position: 'absolute',
          right: -2,
          top: 0,
          bottom: 0,
          width: '8px',
          cursor: 'col-resize',
          backgroundColor: 'transparent',
          zIndex: 10,
        }}
        onMouseEnter={() => {
          if (resizeRef.current) {
            resizeRef.current.style.backgroundColor = 'rgba(59, 78, 255, 0.1)';
          }
        }}
        onMouseLeave={() => {
          if (resizeRef.current) {
            resizeRef.current.style.backgroundColor = 'transparent';
          }
        }}
        onMouseDown={handleMouseDown}
      />
    </aside>
  );
}

export default ComponentLibrary;
