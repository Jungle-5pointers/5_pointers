import React from 'react';
import ButtonRenderer from './ComponentRenderers/ButtonRenderer';
import TextRenderer from './ComponentRenderers/TextRenderer';
import LinkRenderer from './ComponentRenderers/LinkRenderer';
import AttendRenderer from './ComponentRenderers/AttendRenderer';
import MapView from './ComponentEditors/MapView';
import DdayRenderer from './ComponentRenderers/DdayRenderer';
import WeddingContactRenderer from './ComponentRenderers/WeddingContactRenderer';
import WeddingInviteRenderer from './ComponentRenderers/WeddingInviteRenderer';
import ImageRenderer from './ComponentRenderers/ImageRenderer';
import GridGalleryRenderer from './ComponentRenderers/GridGalleryRenderer';
import SlideGalleryRenderer from './ComponentRenderers/SlideGalleryRenderer';
import MapInfoRenderer from './ComponentRenderers/MapInfoRenderer';
import CalendarRenderer from './ComponentRenderers/CalendarRenderer';
import BankAccountRenderer from './ComponentRenderers/BankAccountRenderer';
import CommentRenderer from './ComponentRenderers/CommentRenderer';
import SlidoRenderer from './ComponentRenderers/SlidoRenderer';
import { groupComponentsIntoRows } from './utils/editorUtils';
import './styles/preview.css';

// 개별 컴포넌트를 렌더링하는 헬퍼 컴포넌트 (로직 분리)
const ComponentRenderer = ({ comp }) => {
  switch (comp.type) {
    case 'button':
      return <ButtonRenderer comp={comp} />;
    case 'text':
      return <TextRenderer comp={comp} />;
    case 'link':
      return <LinkRenderer comp={comp} />;
    case 'attend':
      return <AttendRenderer comp={comp} />;
    case 'map':
      return <MapView {...comp.props} />;
    case 'dday':
      return <DdayRenderer comp={comp} />;
    case 'weddingContact':
      return <WeddingContactRenderer comp={comp} />;
    case 'weddingInvite':
      return <WeddingInviteRenderer comp={comp} />;
    case 'image':
      return <ImageRenderer comp={comp} />;
    case 'gridGallery':
      return <GridGalleryRenderer comp={comp} />;
    case 'slideGallery':
      return <SlideGalleryRenderer comp={comp} />;
    case 'mapInfo':
      return <MapInfoRenderer comp={comp} />;
    case 'calendar':
      return <CalendarRenderer comp={comp} />;
    case 'bankAccount':
      return <BankAccountRenderer comp={comp} />;
    case 'comment':
      return <CommentRenderer comp={comp} />;
    case 'slido':
      return <SlidoRenderer comp={comp} />;
    default:
      return null;
  }
};

const PreviewRenderer = ({ pageContent, forcedViewport }) => {
  if (!pageContent || pageContent.length === 0) {
    return (
      <div className="empty-page">
        <div>
          <div className="empty-page-icon">📄</div>
          <div>페이지에 컴포넌트를 추가해보세요</div>
        </div>
      </div>
    );
  }

  // --- 데스크톱 뷰 (절대 위치) - 기본값 ---
  if (forcedViewport !== 'mobile') {
    const maxHeight = Math.max(1080, ...pageContent.map(c => (c.y || 0) + (c.height || 100)));
    return (
      <div className="page-container desktop" style={{ height: `${maxHeight}px` }}>
        {pageContent.map(comp => (
          <div
            key={comp.id}
            style={{
              position: 'absolute',
              left: comp.x || 0,
              top: comp.y || 0,
              width: comp.width ? `${comp.width}px` : 'auto',
              height: comp.height ? `${comp.height}px` : 'auto',
            }}
          >
            <ComponentRenderer comp={comp} />
          </div>
        ))}
      </div>
    );
  }

  // --- 모바일 뷰 (반응형) ---
  const rows = groupComponentsIntoRows(pageContent);

  return (
    <div className="page-container mobile">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="row-wrapper">
          {row.map(comp => (
            <div
              key={comp.id}
              className="component-wrapper"
              style={{
                // [위치 보존] x좌표를 order로 변환
                order: Math.floor((comp.x || 0) / 10),
                // [사이즈 제어] 데스크톱에서의 원래 너비를 인라인 스타일로 지정
                width: comp.width ? `${comp.width}px` : 'auto',
              }}
            >
              <ComponentRenderer comp={comp} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PreviewRenderer;