import React, { useState, useEffect, useRef } from 'react';
import {
  groupComponentsIntoRows,
  getComponentDimensions,
} from './utils/editorUtils';
import ButtonRenderer from './ComponentRenderers/ButtonRenderer';
import TextRenderer from './ComponentRenderers/TextRenderer';
import LinkRenderer from './ComponentRenderers/LinkRenderer';
import AttendRenderer from './ComponentRenderers/AttendRenderer';
import MapView from './ComponentRenderers/MapView';
import DdayRenderer from './ComponentRenderers/DdayRenderer';
import WeddingContactRenderer from './ComponentRenderers/WeddingContactRenderer';
import WeddingInviteRenderer from './ComponentRenderers/WeddingInviteRenderer';
import ImageRenderer from './ComponentRenderers/ImageRenderer';
import GridGalleryRenderer from './ComponentRenderers/GridGalleryRenderer';
import SlideGalleryRenderer from './ComponentRenderers/SlideGalleryRenderer';
import { MapInfoRenderer } from './ComponentRenderers';
import CalendarRenderer from './ComponentRenderers/CalendarRenderer';
import BankAccountRenderer from './ComponentRenderers/BankAccountRenderer';
import CommentRenderer from './ComponentRenderers/CommentRenderer';
import SlidoRenderer from './ComponentRenderers/SlidoRenderer';
import MusicRenderer from './ComponentRenderers/MusicRenderer';
import PageRenderer from './ComponentRenderers/PageRenderer';
import KakaoTalkShareRenderer from './ComponentRenderers/KakaoTalkShareRenderer';
import PageButtonRenderer from './ComponentRenderers/PageButtonRenderer';
import LinkCopyRenderer from './ComponentRenderers/LinkCopyRenderer';

// 컴포넌트 렌더링 헬퍼
const ComponentRenderer = ({ component, editingViewport }) => {
  const props = { comp: component, mode: 'preview', isEditor: false, editingViewport };
  
  switch (component.type) {
    case 'button':
      return <ButtonRenderer {...props} />;
    case 'text':
      return <TextRenderer {...props} />;
    case 'link':
      return <LinkRenderer {...props} />;
    case 'attend':
      return <AttendRenderer {...props} />;
    case 'map':
      return <MapView {...(component.props || {})} comp={component} mode="preview" />;
    case 'dday':
      return <DdayRenderer {...props} />;
    case 'weddingContact':
      return <WeddingContactRenderer {...props} />;
    case 'weddingInvite':
      return <WeddingInviteRenderer {...props} />;
    case 'image':
      return <ImageRenderer {...props} />;
    case 'gridGallery':
      return <GridGalleryRenderer {...props} />;
    case 'slideGallery':
      return <SlideGalleryRenderer {...props} />;
    case 'mapInfo':
      return <MapInfoRenderer {...props} />;
    case 'calendar':
      return <CalendarRenderer {...props} />;
    case 'bankAccount':
      return <BankAccountRenderer {...props} />;
    case 'comment':
      return <CommentRenderer {...props} />;
    case 'slido':
      return <SlidoRenderer {...props} />;
    case 'musicPlayer':
      return <MusicRenderer {...props} />;
    case 'kakaotalkShare':
      return <KakaoTalkShareRenderer {...props} />;
    case 'page':
      return <PageRenderer component={component} mode="preview" />;
    case 'pageButton':
      return <PageButtonRenderer {...props} isPreview={true} />;
    case 'linkCopy': // 추가
      return <LinkCopyRenderer {...props} />;
    default:
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '1px solid #ccc',
            ...component.props?.style,
          }}
        >
          {component.type}
        </div>
      );
  }
};

// 컴포넌트들의 실제 영역 계산
const calculateActualDimensions = (components) => {
  if (!components || components.length === 0) {
    return { width: 400, height: 300, offsetX: 0, offsetY: 0 };
  }

  let maxX = 0;
  let maxY = 0;
  let minX = Infinity;
  let minY = Infinity;

  components.forEach((component) => {
    const x = component.x || 0;
    const y = component.y || 0;
    const width =
      component.width || getComponentDimensions(component.type).defaultWidth;
    const height =
      component.height || getComponentDimensions(component.type).defaultHeight;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  const actualWidth = Math.max(400, maxX - minX + 40); // 최소 400px + 여백 40px
  const actualHeight = Math.max(300, maxY - minY + 40); // 최소 300px + 여백 40px

  return {
    width: actualWidth,
    height: actualHeight,
    offsetX: Math.max(0, minX - 20), // 왼쪽 여백 20px
    offsetY: Math.max(0, minY - 20), // 위쪽 여백 20px
  };
};

const PreviewRenderer = ({ components = [], forcedViewport = null, editingViewport = 'desktop' }) => {
  const [scale, setScale] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef(null);
  const [actualCanvasWidth, setActualCanvasWidth] = useState(375);
  const canvasWidth = forcedViewport === 'mobile' ? actualCanvasWidth : 1920;
  const canvasHeight = forcedViewport === 'mobile' ? 667 : 1080;
  const isMobileView = forcedViewport === 'mobile';

  // 데스크톱 모드에서만 스케일 계산
  useEffect(() => {
    if (isMobileView || !containerRef.current) {
      return;
    }

    const calculateScale = () => {
      const parentElement = containerRef.current.parentElement;
      if (!parentElement) return;

      const availableWidth = parentElement.clientWidth;
      const availableHeight = parentElement.clientHeight;

      const scaleX = availableWidth / canvasWidth;
      const scaleY = availableHeight / canvasHeight;

      setScale(Math.min(scaleX, scaleY));
    };

    calculateScale();

    const iframeWindow = containerRef.current.ownerDocument.defaultView;
    iframeWindow.addEventListener('resize', calculateScale);

    return () => {
      iframeWindow.removeEventListener('resize', calculateScale);
    };
  }, [isMobileView, canvasWidth, canvasHeight]);

  // 데스크톱 편집 기준 → 모바일 미리보기: 재배치 적용
  if (forcedViewport === 'mobile' && editingViewport === 'desktop') {
    const rows = groupComponentsIntoRows(components);

    return (
      <div
        className="page-container"
        style={{
          width: `${canvasWidth}px`,
          minHeight: `${canvasHeight}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 0',
          margin: 0,
          padding: 0,
        }}
      >
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="row-wrapper" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {row.map((component) => {
              const originalWidth = component.width || getComponentDimensions(component.type).defaultWidth;
              const originalHeight = component.height || getComponentDimensions(component.type).defaultHeight;
              const finalWidth = Math.min(originalWidth, canvasWidth - 40);

              // bankAccount는 모바일 preview에서도 버튼만 보이도록 강제
              if (component.type === 'bankAccount') {
                return (
                  <div
                    key={component.id}
                    className="component-wrapper"
                    style={{
                      width: `${finalWidth}px`,
                      height: `${originalHeight}px`
                    }}
                  >
                    <BankAccountRenderer comp={component} mode="preview" isEditor={false} editingViewport={editingViewport} />
                  </div>
                );
              }

              return (
                <div
                  key={component.id}
                  className="component-wrapper"
                  style={{
                    width: `${finalWidth}px`,
                    height: `${originalHeight}px`
                  }}
                >
                  <ComponentRenderer component={component} editingViewport={editingViewport} setModalOpen={setIsModalOpen} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // 컨테이너 스타일 설정
  const containerStyle = {
    background: '#ffffff',
    transformOrigin: 'top left',
    width: isMobileView ? `${canvasWidth}px` : `${canvasWidth}px`,
    height: isMobileView ? 'auto' : `${canvasHeight}px`,
    minHeight: isMobileView ? '812px' : 'auto',   // mobile-viewport 높이에 맞춤    transform: isModalOpen ? 'none' : `scale(${isMobileView ? 1 : scale})`,
    overflow: isMobileView ? 'auto' : 'visible',
    position: 'relative',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    display: isMobileView ? 'block' : undefined,
  };

  return (
    <div
      ref={containerRef}
      className="page-container"
      style={containerStyle}
    >
      {components.map((component) => (
        <div
          key={component.id}
          className="desktop-absolute-wrapper"
          style={{
            position: 'absolute',
            left: component.x || 0,
            top: component.y || 0,
            width:
              component.width ||
              getComponentDimensions(component.type).defaultWidth,
            height:
              component.height ||
              getComponentDimensions(component.type).defaultHeight,
          }}
        >
          <ComponentRenderer component={component} editingViewport={editingViewport} setModalOpen={setIsModalOpen} />
        </div>
      ))}
    </div>
  );
};

export default PreviewRenderer;

