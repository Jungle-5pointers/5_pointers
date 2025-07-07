import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import PreviewRenderer from './PreviewRenderer';
import { VIEWPORT_CONFIGS } from './utils/editorUtils';

const PreviewModal = ({ isOpen, onClose, pageContent, designMode }) => {
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const iframeRef = useRef(null);
  const rootRef = useRef(null);
  const modalRef = useRef(null);

  // 뷰 모드별 크기 설정
  const getViewportSize = (mode) => {
    if (mode === 'desktop') {
      return { width: '100%', height: '100%' };
    }

    const config = VIEWPORT_CONFIGS[mode];
    return config
      ? { width: config.width, height: config.height }
      : { width: '100%', height: '100%' };
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
            <PreviewRenderer
              pageContent={pageContent}
              forcedViewport={viewMode}
              designMode={designMode}
            />
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
  }, [isOpen, pageContent, viewMode, designMode]);

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

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const viewport = getViewportSize(viewMode);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 9999,
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
          width: '100%',
          padding: '16px',
          background: '#fff',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleViewModeChange('desktop')}
            style={{
              padding: '8px 16px',
              background: viewMode === 'desktop' ? '#3B4EFF' : '#fff',
              color: viewMode === 'desktop' ? '#fff' : '#000',
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            데스크탑
          </button>
          <button
            onClick={() => handleViewModeChange('tablet')}
            style={{
              padding: '8px 16px',
              background: viewMode === 'tablet' ? '#3B4EFF' : '#fff',
              color: viewMode === 'tablet' ? '#fff' : '#000',
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            태블릿
          </button>
          <button
            onClick={() => handleViewModeChange('mobile')}
            style={{
              padding: '8px 16px',
              background: viewMode === 'mobile' ? '#3B4EFF' : '#fff',
              color: viewMode === 'mobile' ? '#fff' : '#000',
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            모바일
          </button>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '8px 16px',
            background: '#fff',
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          닫기
        </button>
      </div>

      {/* 중앙 렌더링 영역 */}
      <div
        style={{
          flex: 1,
          width: '100%',
          overflow: 'auto',
          background: '#f8f9fa',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width:
              viewMode === 'mobile'
                ? '375px'
                : viewMode === 'tablet'
                  ? '768px'
                  : '100%',
            margin: '0 auto',
            background: '#fff',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            transition: 'width 0.3s ease',
          }}
        >
          <PreviewRenderer
            pageContent={pageContent}
            forcedViewport={viewMode}
            designMode={designMode}
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
        {viewMode === 'mobile' &&
          `모바일 화면 (${viewport.width}×${viewport.height})에서 보는 모습입니다`}
      </div>
    </div>
  );
};

export default PreviewModal;
