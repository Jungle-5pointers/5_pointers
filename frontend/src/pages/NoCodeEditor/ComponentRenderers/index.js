// ComponentRenderers 모듈들을 한 곳에서 export
export { default as ButtonRenderer } from './ButtonRenderer';
export { default as TextRenderer } from './TextRenderer';
export { default as LinkRenderer } from './LinkRenderer';
export { default as AttendRenderer } from './AttendRenderer';
export { default as ImageRenderer } from './ImageRenderer';
export { default as DdayRenderer } from './DdayRenderer.jsx';
export { default as WeddingContactRenderer } from './WeddingContactRenderer.jsx';

// 컴포넌트 타입별 렌더러 매핑 함수
export function getRendererByType(type) {
  switch (type) {
    case 'button':
      return ButtonRenderer;
    case 'text':
      return TextRenderer;
    case 'link':
      return LinkRenderer;
    case 'attend':
      return AttendRenderer;
    case 'image':
      return ImageRenderer;
    case 'map':
      return MapView;
    case 'dday':
      return DdayRenderer;
    case 'weddingContact':
      return WeddingContactRenderer;
    default:
      return null;
  }
}
