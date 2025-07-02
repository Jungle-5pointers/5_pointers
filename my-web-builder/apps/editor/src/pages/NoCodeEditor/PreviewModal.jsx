import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import PreviewRenderer from './PreviewRenderer';

const PreviewModal = ({ isOpen, onClose, pageContent }) => {
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const iframeRef = useRef(null);
  const rootRef = useRef(null);

  // 뷰 모드별 크기 설정
  const getViewportSize = (mode) => {
    switch (mode) {
      case 'mobile':
        return { width: 375, height: 667 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'desktop':
      default:
        return { width: '100%', height: '100%' };
    }
  };

  // iframe에 React 컴포넌트 렌더링
  useEffect(() => {
    if (!isOpen || !iframeRef.current || !pageContent) return;

    const iframe = iframeRef.current;
    
    // iframe이 완전히 로드될 때까지 대기
    const handleIframeLoad = () => {
      try {
        const iframeDocument = iframe.contentDocument;
        const iframeWindow = iframe.contentWindow;

        if (!iframeDocument || !iframeWindow) return;

        // iframe 내부 HTML 구조 설정
        iframeDocument.open();
        iframeDocument.write(`
          <!DOCTYPE html>
          <html lang="ko">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #ffffff;
                overflow-x: hidden;
                min-height: 100vh;
              }
              #preview-root {
                width: 100%;
                min-height: 100vh;
                position: relative;
              }
            </style>
          </head>
          <body>
            <div id="preview-root"></div>
          </body>
          </html>
        `);
        iframeDocument.close();

        // React 루트 생성 및 컴포넌트 렌더링
        const rootElement = iframeDocument.getElementById('preview-root');
        if (rootElement) {
          // 기존 루트가 있다면 정리
          if (rootRef.current) {
            rootRef.current.unmount();
          }

          // 새 루트 생성 및 렌더링
          rootRef.current = createRoot(rootElement);
          rootRef.current.render(
            <PreviewRenderer pageContent={pageContent} />
          );
        }
      } catch (error) {
        console.error('Failed to render preview:', error);
      }
    };

    // iframe 로드 이벤트 리스너 등록
    iframe.addEventListener('load', handleIframeLoad);
    
    // iframe이 이미 로드된 경우 즉시 실행
    if (iframe.contentDocument?.readyState === 'complete') {
      handleIframeLoad();
    }

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, [isOpen, pageContent]);

  // 모달이 닫힐 때 정리
  useEffect(() => {
    if (!isOpen && rootRef.current) {
      rootRef.current.unmount();
      rootRef.current = null;
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const viewport = getViewportSize(viewMode);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        // 배경 클릭 시 모달 닫기
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* 상단 컨트롤 바 */}
      <div
        style={{
          height: 60,
          background: 'rgba(255, 255, 255, 0.95)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* 왼쪽: 제목 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#1d2129',
            }}
          >
            🔍 페이지 미리보기
          </div>
          <div
            style={{
              fontSize: 14,
              color: '#65676b',
              background: '#f0f2f5',
              padding: '4px 8px',
              borderRadius: 4,
            }}
          >
            {pageContent?.length || 0}개 컴포넌트
          </div>
        </div>

        {/* 중앙: 뷰 모드 전환 버튼 */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { mode: 'desktop', icon: '🖥️', label: '데스크톱' },
            { mode: 'mobile', icon: '📱', label: '모바일' },
          ].map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: 8,
                background: viewMode === mode ? '#3B4EFF' : '#f0f2f5',
                color: viewMode === mode ? '#fff' : '#65676b',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: viewMode === mode ? 'scale(1.05)' : 'scale(1)',
              }}
              onMouseEnter={(e) => {
                if (viewMode !== mode) {
                  e.target.style.background = '#e4e6ea';
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== mode) {
                  e.target.style.background = '#f0f2f5';
                }
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* 오른쪽: 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            width: 40,
            height: 40,
            border: 'none',
            borderRadius: 8,
            background: '#f0f2f5',
            color: '#65676b',
            cursor: 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#e4e6ea';
            e.target.style.color = '#1d2129';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#f0f2f5';
            e.target.style.color = '#65676b';
          }}
        >
          ✕
        </button>
      </div>

      {/* 중앙 렌더링 영역 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          minHeight: 0,
        }}
      >
        <div
          style={{
            width: viewport.width,
            height: viewport.height,
            maxWidth: 'calc(100vw - 80px)',
            maxHeight: 'calc(100vh - 140px)',
            background: '#ffffff',
            borderRadius: viewMode !== 'desktop' ? 16 : 8,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: viewMode === 'mobile' ? 'scale(1)' : 'scale(1)',
            border: viewMode !== 'desktop' ? '8px solid #2d3748' : 'none',
            position: 'relative',
          }}
        >
          {/* 디바이스 프레임 데코레이션 (모바일/태블릿) */}
          {viewMode !== 'desktop' && (
            <>
              {/* 상단 노치/스피커 */}
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: viewMode === 'mobile' ? 120 : 160,
                  height: 6,
                  background: '#1a202c',
                  borderRadius: '0 0 8px 8px',
                  zIndex: 10,
                }}
              />
              {/* 홈 인디케이터 (모바일) */}
              {viewMode === 'mobile' && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -6,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 80,
                    height: 3,
                    background: '#4a5568',
                    borderRadius: 2,
                    zIndex: 10,
                  }}
                />
              )}
            </>
          )}

          {/* iframe 컨테이너 */}
          <iframe
            ref={iframeRef}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: viewMode !== 'desktop' ? 8 : 0,
            }}
            title="Page Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>

      {/* 하단 상태 표시 */}
      <div
        style={{
          height: 40,
          background: 'rgba(255, 255, 255, 0.95)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          color: '#65676b',
          backdropFilter: 'blur(10px)',
        }}
      >
        {viewMode === 'desktop' && '데스크톱 화면에서 보는 모습입니다'}
        {viewMode === 'mobile' && `모바일 화면 (${viewport.width}×${viewport.height})에서 보는 모습입니다`}
      </div>
    </div>
  );
};

export default PreviewModal; 