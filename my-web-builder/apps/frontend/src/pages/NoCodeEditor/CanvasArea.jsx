// frontend/src/pages/NoCodeEditor/CanvasArea.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LiveCursors, CollaborativeSelections } from '../../components/collaboration/LiveCursors';
import PageNavigation from './components/PageNavigation';

// 그리드 크기 상수 import 또는 선언
const GRID_SIZE = 50;

// 섹션 추가 버튼 컴포넌트
function AddSectionButton({ canvasHeight, viewport, onAddSection }) {
  // 현재 캔버스의 높이 사용 (더미 컴포넌트 필요 없음)
  const currentMaxY = canvasHeight;

  // 캔버스 너비 계산
  const canvasWidth = viewport === 'mobile' ? 375 : 1920;

  return (
    <div style={{
      position: 'absolute',
      left: 0,
      top: currentMaxY + 50,
      width: canvasWidth,
      zIndex: 10,
      padding: '0 20px', // 좌우 여백
      boxSizing: 'border-box'
    }}>
      <button
        onClick={() => {
          if (onAddSection) {
            // 새 섹션의 시작 위치 (현재 최대 Y + 여백)
            const newSectionY = currentMaxY + 100;

            // 부모 컴포넌트에 새 섹션 추가 요청
            onAddSection(newSectionY);
          } else {
            // onAddSection이 없는 경우 기본 동작
            alert('캔버스가 확장되었습니다! 새로운 영역에 컴포넌트를 추가해보세요.');
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px',
          backgroundColor: 'white',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          color: '#6b7280',
          transition: 'all 0.2s ease',
          width: '100%', // 캔버스 너비에 맞게 확장
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = '#3B4EFF';
          e.target.style.color = '#3B4EFF';
          e.target.style.backgroundColor = '#f8faff';
          e.target.style.boxShadow = '0 4px 12px rgba(59, 78, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = '#d1d5db';
          e.target.style.color = '#6b7280';
          e.target.style.backgroundColor = 'white';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }}
        title="새로운 섹션을 추가하여 캔버스를 확장합니다"
      >
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span>
        <span>섹션 추가</span>
      </button>
    </div>
  );
}

function CanvasArea({
  canvasRef,
  containerRef,
  components,
  selectedId,
  users,
  nickname,
  snapLines,
  setSnapLines,
  onDrop, onDragOver,
  onClick, onMouseMove, onMouseUp,
  onSelect,
  onUpdate,
  onDelete,
  onAddSection, // 새 섹션 추가 함수
  CanvasComponent,
  UserCursor,
  zoom = 100,
  onZoomChange,
  viewport = 'desktop', // 새로 추가: 뷰포트 모드
  canvasHeight, // 캔버스 높이
  isInspectorOpen = false, // Inspector 열림 상태
  isLibraryOpen = true, // 컴포넌트 라이브러리 열림 상태
  updateCursorPosition, // 협업 커서 위치 업데이트 함수
  // 협업 기능 props 추가
  otherCursors = [],
  otherSelections = [],
  getComponentDimensions, // 컴포넌트 크기 함수
  onPageChange // 페이지 변경 콜백
}) {
  const [localZoom, setLocalZoom] = useState(zoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);

  // 패닝(캔버스 드래그 이동) 관련 상태
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // 컴포넌트 드래그 상태 감지
  const [isComponentDragging, setIsComponentDragging] = useState(false);

  const LIBRARY_WIDTH = 240; // 좌측 패널(컴포넌트 라이브러리) width와 동일하게!

  // 줌 핸들러
  const handleZoom = (delta) => {
    const newZoom = Math.max(25, Math.min(400, localZoom + delta));
    setLocalZoom(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  // 마우스 휠로 줌 또는 스크롤
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd + 휠: 줌
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      handleZoom(delta);
    } else if (isComponentDragging) {
      // 컴포넌트 드래그 중일 때는 스크롤 차단
      e.preventDefault();
    } else {
      // 일반 휠: 스크롤 (기본 동작 허용)
      // 브라우저의 기본 스크롤 동작을 그대로 사용
    }
  };

  // 협업 커서 위치 업데이트 핸들러
  const handleCanvasMouseMove = (e) => {
    if (updateCursorPosition) {
      updateCursorPosition(e.clientX, e.clientY, localZoom, viewport);
    }
    onMouseMove(e);
  };

  // 마우스가 캔버스를 벗어날 때 커서 숨기기
  const handleCanvasMouseLeave = () => {
    if (updateCursorPosition) {
      // 커서 위치를 null로 설정하여 숨김
      updateCursorPosition(null, null, localZoom, viewport);
    }
  };

  // 패닝 시작
  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.spaceKey)) { // 중간 버튼 또는 스페이스바 + 좌클릭
      e.preventDefault();
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  // 패닝 중
  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
    onMouseMove(e);
  };

  // 드롭 시 snapLines 항상 초기화
  const handleDrop = (e) => {
    if (onDrop) onDrop(e);
    if (setSnapLines) {
      setSnapLines({ vertical: [], horizontal: [] });
    }
  };

  // 마우스업 
  const handleMouseUp = (e) => {
    setIsDragging(false);
    if (onMouseUp) onMouseUp(e);
    if (setSnapLines) {
      setSnapLines({ vertical: [], horizontal: [] });
    }
  };

  // 캔버스 컨테이너에서 마우스 드래그로 스크롤 이동
  const handleContainerMouseDown = (e) => {
    // 컴포넌트 드래그 중이면 패닝하지 않음
    if (isComponentDragging) {
      return;
    }

    // 컨테이너의 빈 영역에서만 동작 (컴포넌트나 컴포넌트 관련 요소 위에서는 무시)
    const isClickOnComponent = e.target.closest('[data-component-id]') !== null ||
      e.target.closest('.canvas-component') !== null ||
      e.target.style.cursor === 'grab' ||
      e.target.style.cursor === 'grabbing' ||
      e.target.tagName === 'BUTTON';

    if ((e.target === containerRef.current || e.target === canvasRef.current) && !isClickOnComponent) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: containerRef.current.scrollLeft,
        scrollTop: containerRef.current.scrollTop,
      });
    }
  };

  const handleContainerMouseMove = (e) => {
    if (isPanning && !isComponentDragging) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      containerRef.current.scrollLeft = panStart.scrollLeft - dx;
      containerRef.current.scrollTop = panStart.scrollTop - dy;
    } else if (isComponentDragging) {
      // 컴포넌트 드래그 중이면 패닝 중지
      setIsPanning(false);
    }
  };

  const handleContainerMouseUp = () => setIsPanning(false);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleContainerMouseMove);
      window.addEventListener('mouseup', handleContainerMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleContainerMouseMove);
        window.removeEventListener('mouseup', handleContainerMouseUp);
      };
    }
  }, [isPanning, panStart, isComponentDragging]);

  // 컴포넌트 드래그 상태 감지 - 더 강력한 방법
  useEffect(() => {
    const handleMouseDown = (e) => {
      const componentElement = e.target.closest('[data-component-id]') || e.target.closest('.canvas-component');
      if (componentElement) {
        setIsComponentDragging(true);

        // 컨테이너의 모든 스크롤 관련 속성 차단
        if (containerRef.current) {
          const container = containerRef.current;
          // 현재 스크롤 위치 저장
          const currentScrollLeft = container.scrollLeft;
          const currentScrollTop = container.scrollTop;

          // 스크롤 차단
          container.style.overflow = 'hidden';
          container.style.pointerEvents = 'none';

          // 스크롤 위치 고정
          const preventScroll = () => {
            container.scrollLeft = currentScrollLeft;
            container.scrollTop = currentScrollTop;
          };

          // 스크롤 이벤트 리스너 추가
          container.addEventListener('scroll', preventScroll);

          // cleanup 함수를 위해 저장
          componentElement._preventScroll = preventScroll;
          componentElement._currentScrollLeft = currentScrollLeft;
          componentElement._currentScrollTop = currentScrollTop;
        }
      }
    };

    const handleMouseUp = () => {
      setIsComponentDragging(false);

      // 컨테이너의 스크롤을 다시 활성화
      if (containerRef.current) {
        const container = containerRef.current;
        container.style.overflow = 'auto';
        container.style.pointerEvents = 'auto';

        // 모든 컴포넌트에서 스크롤 이벤트 리스너 제거
        const allComponents = document.querySelectorAll('[data-component-id]');
        allComponents.forEach(comp => {
          if (comp._preventScroll) {
            container.removeEventListener('scroll', comp._preventScroll);
            delete comp._preventScroll;
            delete comp._currentScrollLeft;
            delete comp._currentScrollTop;
          }
        });
      }
    };

    // 전역 이벤트로 더 확실하게 감지
    window.addEventListener('mousedown', handleMouseDown, { capture: true });
    window.addEventListener('mouseup', handleMouseUp, { capture: true });

    return () => {
      window.removeEventListener('mousedown', handleMouseDown, { capture: true });
      window.removeEventListener('mouseup', handleMouseUp, { capture: true });
    };
  }, []);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 🔥 텍스트 입력 중이면 키보드 이벤트 무시
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return; // 텍스트 입력 중에는 CanvasArea에서 처리하지 않음
      }

      if (e.code === 'Space') {
        e.preventDefault();
        document.body.style.cursor = 'grab';
      }
      // G 키로 그리드 토글
      if (e.code === 'KeyG') {
        e.preventDefault();
        setShowGrid(prev => !prev);
      }

      // 화살표 키로 캔버스 스크롤
      if (containerRef.current && !e.ctrlKey && !e.metaKey) {
        const scrollAmount = 50;
        let scrolled = false;

        switch (e.code) {
          case 'ArrowUp':
            e.preventDefault();
            containerRef.current.scrollTop -= scrollAmount;
            scrolled = true;
            break;
          case 'ArrowDown':
            e.preventDefault();
            containerRef.current.scrollTop += scrollAmount;
            scrolled = true;
            break;
          case 'ArrowLeft':
            e.preventDefault();
            containerRef.current.scrollLeft -= scrollAmount;
            scrolled = true;
            break;
          case 'ArrowRight':
            e.preventDefault();
            containerRef.current.scrollLeft += scrollAmount;
            scrolled = true;
            break;
        }
      }
    };

    const handleKeyUp = (e) => {
      // 🔥 텍스트 입력 중이면 키보드 이벤트 무시
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        document.body.style.cursor = 'default';
      }
    };

    const handleGlobalWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', handleGlobalWheel);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // 중앙으로 스크롤 (초기 로딩 시에만)
  useEffect(() => {
    const scrollToCenter = () => {
      if (containerRef.current && canvasRef.current) {
        const container = containerRef.current;
        const canvas = canvasRef.current;

        // 중앙으로 스크롤 (부드럽게)
        container.scrollTo({
          left: Math.max(0, (canvas.scrollWidth - container.clientWidth) / 2),
          top: Math.max(0, (canvas.scrollHeight - container.clientHeight) / 2),
          behavior: 'smooth'
        });
      }
    };

    // 약간의 딜레이를 두고 스크롤 (DOM이 완전히 렌더링된 후)
    const timeoutId = setTimeout(scrollToCenter, 300);

    return () => clearTimeout(timeoutId);
  }, [viewport]); // viewport가 변경될 때마다 재실행

  // 줌 레벨 동기화
  useEffect(() => {
    setLocalZoom(zoom);
  }, [zoom]);

  // 스타일링 변수들
  const zoomScale = localZoom / 100;

  // 슬라이더 핸들러 
  const handleSliderChange = (e) => {
    const newZoom = parseInt(e.target.value);
    setLocalZoom(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  const getCanvasStyles = () => {
    // canvasHeight prop을 사용하여 동적 높이 설정 (더미 컴포넌트 불필요)
    const effectiveHeight = canvasHeight || (viewport === 'mobile' ? 667 : 1080);

    return {
      position: 'relative',
      width: viewport === 'mobile' ? 375 : 1920,
      height: effectiveHeight,
      background: showGrid ?
        `linear-gradient(to right, #e1e5e9 1px, transparent 1px),
         linear-gradient(to bottom, #e1e5e9 1px, transparent 1px)` :
        '#fff',
      backgroundSize: showGrid ? `${GRID_SIZE}px ${GRID_SIZE}px` : 'auto',
      backgroundPosition: showGrid ? '0 0' : 'initial',
      border: '1px solid #e1e5e9',
      borderRadius: 12,
      margin: '0 auto',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      transform: `scale(${zoomScale})`,
      transformOrigin: 'top left',
      overflow: 'visible',
      cursor: isPanning ? 'grabbing' : 'default'
    };
  };

  // 확장된 캔버스의 실제 크기 계산 (섹션 추가 버튼으로만 확장)
  const getActualCanvasSize = () => {
    const baseCanvasWidth = viewport === 'mobile' ? 375 : 1920;

    // canvasHeight prop을 사용하여 캔버스 높이 계산 (더미 컴포넌트 불필요)
    const effectiveHeight = canvasHeight || (viewport === 'mobile' ? 667 : 1080);

    return { width: baseCanvasWidth, height: effectiveHeight };
  };

  const actualCanvasSize = getActualCanvasSize();
  // 좌측 패딩(라이브러리 상태에 따라) + 우측 패딩(60px) + 여유 공간을 포함
  const leftPadding = isLibraryOpen ? 280 : 40; // 라이브러리 열림/닫힘에 따라
  const containerWidth = actualCanvasSize.width + (viewport === 'mobile' ? 40 : leftPadding + 60); // 모바일: 40px, 데스크톱: 동적
  const containerHeight = actualCanvasSize.height + 400; // 상하 패딩과 여유 공간 포함

  // 디버깅: 캔버스 크기 정보 콘솔 출력
  // console.log('Canvas Size Debug:', {
  //   canvasHeight,
  //   actualCanvasSize,
  //   containerWidth,
  //   containerHeight,
  //   viewport,
  //   extenderComponents: components.filter(comp => comp.id.startsWith('canvas-extender-')).length
  // });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#f0f1f5',
        cursor: isPanning ? 'grabbing' : 'default',
        // 뷰포트별 스크롤 설정
        overflowX: viewport === 'mobile' ? 'hidden' : 'auto',
        overflowY: 'auto',
        paddingTop: '60px' // 헤더 높이만큼 상단 패딩
      }}
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleContainerMouseDown}
      onScroll={(e) => {
        // 컴포넌트 드래그 중일 때 스크롤 이벤트 차단
        if (isComponentDragging) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {/* 페이지 네비게이션 */}
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 1000,
        width: '280px'
      }}>
        <PageNavigation components={components} onPageChange={onPageChange} />
      </div>
      {/* ===== OUTER WRAPPER: 캔버스 컨테이너 ===== */}
      <div
        style={{
          width: `${containerWidth}px`, // 동적 너비 설정
          height: `${containerHeight}px`, // 동적 높이 설정
          minWidth: '100%', // 최소 너비는 부모 컨테이너 크기
          display: 'flex',
          justifyContent: 'flex-start', // 좌측 정렬로 변경
          alignItems: 'flex-start',
          // 뷰포트별 패딩 조정 (좌측은 컴포넌트 라이브러리 상태에 따라 동적 조정)
          padding: viewport === 'mobile'
            ? '20px'
            : `40px 60px 200px ${isLibraryOpen ? '280px' : '40px'}`, // 라이브러리 열림: 280px, 닫힘: 40px
          boxSizing: 'border-box'
        }}
      >
        {/* ===== INNER WRAPPER: 실제 캔버스 프레임 ===== */}
        <div
          ref={canvasRef}
          className={`canvas-frame viewport-${viewport}`}
          style={getCanvasStyles()}
          onDrop={handleDrop}
          onDragOver={onDragOver}
          onClick={onClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={(e) => {
            handleMouseUp(e);
            handleCanvasMouseLeave();
          }}
        >
          {/* ===== 반응형 스타일링 ===== */}
          <style>{`
            /* 뷰포트별 기본 스타일 */
            .canvas-frame {
              font-family: 'Inter', 'Noto Sans KR', sans-serif;
            }
            
            /* 데스크톱 뷰 기본 스타일 */
            .canvas-frame.viewport-desktop {
              /* 데스크톱에서의 기본 스타일 */
            }
            
            /* 모바일 뷰 반응형 스타일 */
            .canvas-frame.viewport-mobile {
              /* 모바일에서 텍스트 크기 조정 */
            }
            
            /* 그리드 컴포넌트 반응형 */
            .canvas-frame .grid-component {
              display: grid;
              gap: 16px;
            }
            
            .canvas-frame.viewport-desktop .grid-component {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .canvas-frame.viewport-mobile .grid-component {
              grid-template-columns: 1fr;
            }
            
            /* 텍스트 컴포넌트 반응형 */
            .canvas-frame.viewport-mobile .text-component {
              font-size: 14px !important;
              line-height: 1.4 !important;
            }
            
            /* 버튼 컴포넌트 반응형 */
            .canvas-frame.viewport-mobile .button-component {
              padding: 12px 16px !important;
              font-size: 14px !important;
            }
            
            /* 이미지 컴포넌트 반응형 */
            .canvas-frame.viewport-mobile .image-component {
              max-width: 100% !important;
              height: auto !important;
            }
            
            /* 뱅크 계좌 컴포넌트 반응형 */
            .canvas-frame.viewport-mobile .bank-account-component {
              padding: 12px !important;
            }
            
            .canvas-frame.viewport-mobile .bank-account-component .account-item {
              padding: 8px !important;
              font-size: 12px !important;
            }
          `}</style>

          {/* snapLines 렌더링 (정렬/간격/그리드/중앙선 타입별 색상) */}
          {snapLines.vertical.map((line, index) => (
            <div
              key={`v-${index}`}
              style={{
                position: 'absolute',
                left: line.x,
                top: 0,
                width: 2,
                height: '100%',
                background:
                  line.type === 'center' ? '#9C27B0' :
                    line.type === 'align' ? '#FF4081' :
                      line.type === 'spacing' ? '#00E676' :
                        '#FFB300',
                zIndex: 1000,
                pointerEvents: 'none',
                boxShadow: line.type === 'center' ? '0 0 12px rgba(156, 39, 176, 0.8)' :
                  line.type === 'align' ? '0 0 8px rgba(255, 64, 129, 0.6)' :
                    line.type === 'spacing' ? '0 0 8px rgba(0, 230, 118, 0.6)' :
                      '0 0 6px rgba(255, 179, 0, 0.5)',
                opacity: line.type === 'center' ? 1 : 0.9
              }}
            />
          ))}

          {snapLines.horizontal.map((line, index) => (
            <div
              key={`h-${index}`}
              style={{
                position: 'absolute',
                left: 0,
                top: line.y,
                width: '100%',
                height: 2,
                background:
                  line.type === 'center' ? '#9C27B0' :
                    line.type === 'align' ? '#FF4081' :
                      line.type === 'spacing' ? '#00E676' :
                        '#FFB300',
                zIndex: 1000,
                pointerEvents: 'none',
                boxShadow: line.type === 'center' ? '0 0 12px rgba(156, 39, 176, 0.8)' :
                  line.type === 'align' ? '0 0 8px rgba(255, 64, 129, 0.6)' :
                    line.type === 'spacing' ? '0 0 8px rgba(0, 230, 118, 0.6)' :
                      '0 0 6px rgba(255, 179, 0, 0.5)',
                opacity: line.type === 'center' ? 1 : 0.9
              }}
            />
          ))}

          {/* 캔버스 내 컴포넌트 렌더링 (더미 컴포넌트 제외) */}
          {components
            .filter((comp, index, arr) => {
              // 중복 ID 제거: 같은 ID를 가진 첫 번째 컴포넌트만 유지
              const firstIndex = arr.findIndex(c => c.id === comp.id);
              return firstIndex === index;
            })
            .map((comp, index) => {
              // if (comp.type === 'button') console.log('버튼 컴포넌트 렌더링:', comp);
              return (
                <CanvasComponent
                  key={`${comp.id}-${index}`}
                  comp={comp}
                  selected={selectedId === comp.id}
                  onSelect={onSelect}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  setSnapLines={setSnapLines}
                  zoom={localZoom}
                  viewport={viewport}
                  components={components}
                  getComponentDimensions={getComponentDimensions}
                  canvasHeight={canvasHeight} // 확장된 캔버스 높이 전달
                  updateCursorPosition={updateCursorPosition} // 협업 커서 위치 업데이트 함수 전달
                />
              );
            })}

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

          {/* 선택 영역 표시 */}
          {selectedId && (
            <div style={{
              position: 'absolute',
              border: '2px solid #3B4EFF',
              borderRadius: 4,
              pointerEvents: 'none',
              zIndex: 5
            }} />
          )}

          {/* 섹션 추가 버튼 - 캔버스 내부 하단에 위치 */}
          <AddSectionButton
            canvasHeight={canvasHeight}
            viewport={viewport}
            onAddSection={onAddSection}
          />

          {/* 협업 기능: 라이브 커서 */}
          <LiveCursors
            cursors={otherCursors}
            zoom={localZoom}
            viewport={viewport}
          />

          {/* 협업 기능: 다른 사용자 선택 영역 */}
          <CollaborativeSelections
            selections={otherSelections}
            components={components}
            zoom={localZoom}
            viewport={viewport}
            getComponentDimensions={getComponentDimensions}
          />
        </div>
      </div>

      {/* 스크롤바 스타일링 */}
      <style>{`
        /* 캔버스 컨테이너 스크롤바 스타일 */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        ::-webkit-scrollbar-track {
          background: #f0f1f5;
          border-radius: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 6px;
          border: 2px solid #f0f1f5;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        ::-webkit-scrollbar-thumb:active {
          background: #6b7280;
        }
        ::-webkit-scrollbar-corner {
          background: #f0f1f5;
        }
        
        /* Firefox 스크롤바 스타일 */
        * {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f0f1f5;
        }
      `}</style>
    </div>
  );
}

export default CanvasArea;
