import React, { useState, useEffect } from 'react';
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
import { getFinalStyles, VIEWPORT_CONFIGS } from './utils/editorUtils';
import { ComponentRenderers } from './ComponentRenderers';

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
  comment: commentDef,
};

/**
 * 미리보기/배포용 렌더러
 * 두 가지 렌더링 모드 지원:
 * 1. 절대 좌표 모드 (데스크탑 미리보기)
 * 2. Flexbox 모드 (모바일/태블릿 미리보기)
 */
const PreviewRenderer = ({
  pageContent = [],
  forcedViewport = 'desktop',
  designMode = 'desktop',
}) => {
  const currentViewport = forcedViewport;

  // 1. 렌더링 모드 결정
  const isAbsoluteLayout =
    designMode === 'desktop' && currentViewport === 'desktop';

  // 2. 컴포넌트 정렬 (Flexbox 모드일 때만 의미 있음)
  const getSortedComponents = () => {
    if (isAbsoluteLayout) {
      return pageContent; // 절대 좌표 모드에서는 정렬 불필요
    }
    // 'desktop' 디자인을 다른 뷰포트로 볼 때만 정렬
    if (designMode === 'desktop') {
      return [...pageContent].sort((a, b) => {
        const yDiff = a.y - b.y;
        return Math.abs(yDiff) < 20 ? a.x - b.x : yDiff;
      });
    }
    return pageContent; // 'mobile' 디자인은 저장된 순서 그대로
  };

  // 3. 개별 컴포넌트 렌더링 함수
  const renderSingleComponent = (comp) => {
    const Renderer = ComponentRenderers[comp.type];
    if (!Renderer) return null;

    // 현재 뷰포트에 맞는 스타일 적용
    const finalStyles = getFinalStyles(comp, currentViewport);

    // isAbsoluteLayout 값에 따라 스타일 결정
    const style = isAbsoluteLayout
      ? {
          position: 'absolute',
          left: comp.x,
          top: comp.y,
          width: comp.width,
          height: comp.height,
          ...finalStyles.style,
        }
      : {
          width: '100%',
          maxWidth: `${comp.width}px`,
          margin: '0 auto',
          ...finalStyles.style,
        };

    return (
      <div key={comp.id} style={style}>
        <Renderer
          comp={{ ...comp, props: finalStyles.props }}
          isEditor={false}
        />
      </div>
    );
  };

  // 빈 페이지 처리
  if (!pageContent || !Array.isArray(pageContent) || pageContent.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontSize: 16,
          color: '#6c757d',
          background: '#f8f9fa',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <div>페이지에 컴포넌트를 추가해보세요</div>
          <div style={{ fontSize: 14, marginTop: 8, opacity: 0.7 }}>
            좌측 컴포넌트 라이브러리에서 원하는 컴포넌트를 드래그해서 추가할 수
            있습니다
          </div>
        </div>
      </div>
    );
  }

  const componentsToRender = getSortedComponents();

  // 4. 전체 캔버스/컨테이너 렌더링 (조건부)
  if (isAbsoluteLayout) {
    // 캔버스 크기 계산
    const canvasSize = calculateAbsoluteCanvasSize(pageContent);
    return (
      <div
        style={{
          position: 'relative',
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          margin: '0 auto',
        }}
      >
        {componentsToRender.map(renderSingleComponent)}
      </div>
    );
  } else {
    // 뷰포트별 최대 너비 설정
    const maxWidth =
      currentViewport === 'mobile'
        ? '100%'
        : currentViewport === 'tablet'
          ? '768px'
          : '1200px';

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          width: '100%',
          maxWidth: maxWidth,
          margin: '0 auto',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        {componentsToRender.map(renderSingleComponent)}
      </div>
    );
  }
};

// 절대 좌표 레이아웃의 전체 크기를 계산하는 헬퍼 함수
const calculateAbsoluteCanvasSize = (components) => {
  if (!components || components.length === 0)
    return { width: 1920, height: 1080 };

  let maxX = 1920;
  let maxY = 1080;

  components.forEach((comp) => {
    maxX = Math.max(maxX, comp.x + comp.width);
    maxY = Math.max(maxY, comp.y + comp.height);
  });

  return {
    width: maxX,
    height: maxY + 200, // 하단 여백 추가
  };
};

export default PreviewRenderer;
