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

// 컴포넌트 definitions import
import buttonDef from '../components/definitions/button.json';
import textDef from '../components/definitions/text.json';
import linkDef from '../components/definitions/link.json';
import mapDef from '../components/definitions/map.json';
import attendDef from '../components/definitions/attend.json';
import imageDef from '../components/definitions/image.json';
import ddayDef from '../components/definitions/d-day.json';
import weddingContactDef from '../components/definitions/wedding-contact.json';
import weddingInviteDef from '../components/definitions/wedding-invite.json';
import bankAccountDef from '../components/definitions/bank-account.json';
import gridGalleryDef from '../components/definitions/grid-gallery.json';
import slideGalleryDef from '../components/definitions/slide-gallery.json';
import mapInfoDef from '../components/definitions/map_info.json';
import calendarDef from '../components/definitions/calendar.json';
import commentDef from '../components/definitions/comment.json';

// 컴포넌트 정의들을 맵으로 구성
const componentDefinitions = {
  button: buttonDef,
  text: textDef,
  link: linkDef,
  map: mapDef,
  attend: attendDef,
  image: imageDef,
  dday: ddayDef,
  weddingContact: weddingContactDef,
  weddingInvite: weddingInviteDef,
  bankAccount: bankAccountDef,
  gridGallery: gridGalleryDef,
  slideGallery: slideGalleryDef,
  mapInfo: mapInfoDef,
  calendar: calendarDef,
  comment: commentDef
};

/**
 * PreviewRenderer - iframe 내부에서 실제 페이지를 렌더링하는 순수 컴포넌트
 * 
 * 이 컴포넌트는:
 * 1. 편집 기능이 완전히 제거된 순수한 렌더링만 담당
 * 2. 실제 배포 환경과 동일한 모습을 보여줌
 * 3. 드래그, 선택, 편집 등의 에디터 기능은 포함하지 않음
 */
const PreviewRenderer = ({ pageContent }) => {
  // 컴포넌트의 props와 defaultProps를 병합하는 함수
  const getMergedProps = (comp) => {
    const definition = componentDefinitions[comp.type];
    const defaultProps = definition?.defaultProps || {};
    return { ...defaultProps, ...(comp.props || {}) };
  };

  // 컴포넌트 타입별 렌더링 함수
  const renderComponent = (comp) => {
    const mergedProps = getMergedProps(comp);
    
    const baseStyle = {
      position: 'absolute',
      left: comp.x,
      top: comp.y,
      width: comp.width || 'auto',
      height: comp.height || 'auto',
      // 편집 관련 스타일 제거 (border, cursor 등)
    };

    // 병합된 props로 새로운 comp 객체 생성
    const compWithMergedProps = {
      ...comp,
      props: mergedProps
    };

    const componentContent = (() => {
      switch (comp.type) {
        case 'button':
          return <ButtonRenderer comp={compWithMergedProps} isEditor={false} />;
        case 'text':
          return <TextRenderer comp={compWithMergedProps} isEditor={false} />;
        case 'link':
          return <LinkRenderer comp={compWithMergedProps} isEditor={false} />;
        case 'attend':
          return <AttendRenderer comp={compWithMergedProps} isEditor={false} />;
        case 'map':
          return <MapView {...mergedProps} isEditor={false} />;
        case 'dday':
          return <DdayRenderer comp={compWithMergedProps} isEditor={false} />;
        case 'weddingContact':
          return <WeddingContactRenderer comp={compWithMergedProps} isEditor={false} />;
        case 'weddingInvite':
          return <WeddingInviteRenderer comp={compWithMergedProps} isEditor={false} />;
        case 'image':
          return <ImageRenderer comp={compWithMergedProps} isEditor={false} />;
        case 'gridGallery':
          return <GridGalleryRenderer comp={compWithMergedProps} isEditor={false} />;
        case 'slideGallery':
          return <SlideGalleryRenderer comp={compWithMergedProps} isEditor={false} />;
        case 'mapInfo':
          return <MapInfoRenderer comp={compWithMergedProps} isEditor={false} />;
        case 'calendar':
          return <CalendarRenderer comp={compWithMergedProps} isEditor={false} />;
        case 'comment':
          return <CommentRenderer comp={compWithMergedProps} isEditor={false} />;
        case 'bankAccount':
          return <BankAccountRenderer comp={compWithMergedProps} isEditor={false} />;
        default:
          return (
            <div style={{
              padding: '8px 12px',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: 4,
              fontSize: 14,
              color: '#6c757d'
            }}>
              {mergedProps.text || comp.type}
            </div>
          );
      }
    })();

    return (
      <div
        key={comp.id}
        data-component-type={comp.type}
        data-component-id={comp.id}
        // 미리보기에서는 실제 동작 허용 (링크, 버튼 등)
        style={{
          ...baseStyle,
          pointerEvents: 'auto', // 실제 동작 활성화 (링크, 버튼 클릭 등)
          userSelect: 'text'     // 텍스트 선택 가능
        }}
      >
        {componentContent}
      </div>
    );
  };

  // 확장된 캔버스 크기 계산
  const calculateCanvasSize = () => {
    if (!pageContent || !Array.isArray(pageContent) || pageContent.length === 0) {
      return { width: 1920, height: 1080 };
    }

    // 모든 컴포넌트의 최대 위치 계산
    let maxX = 1920;
    let maxY = 1080;

    pageContent.forEach(comp => {
      if (comp.id && comp.id.startsWith('canvas-extender-')) {
        // 확장 컴포넌트는 캔버스 크기 계산에 포함
        maxY = Math.max(maxY, comp.y + (comp.height || 0) + 100);
      } else {
        // 일반 컴포넌트의 경우 실제 위치 + 크기로 계산
        maxX = Math.max(maxX, comp.x + (comp.width || 200));
        maxY = Math.max(maxY, comp.y + (comp.height || 100) + 100);
      }
    });

    return { width: maxX, height: maxY };
  };

  const canvasSize = calculateCanvasSize();

  if (!pageContent || !Array.isArray(pageContent)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: 16,
        color: '#6c757d',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <div>페이지에 컴포넌트를 추가해보세요</div>
          <div style={{ fontSize: 14, marginTop: 8, opacity: 0.7 }}>
            좌측 컴포넌트 라이브러리에서 원하는 컴포넌트를 드래그해서 추가할 수 있습니다
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: `${canvasSize.width}px`,
      height: `${canvasSize.height}px`,
      background: '#ffffff',
      margin: '0 auto',
      minHeight: '100vh',
      overflow: 'visible'
    }}>
      {/* 모든 컴포넌트 렌더링 (확장 컴포넌트 제외) */}
      {pageContent
        .filter(comp => !comp.id.startsWith('canvas-extender-'))
        .map(renderComponent)}
      
      {/* 페이지 하단 여백 (필요시) */}
      <div style={{ 
        height: 100, 
        width: '100%',
        position: 'absolute',
        bottom: 0,
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default PreviewRenderer; 