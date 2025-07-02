// ComponentRenderers 모듈들을 한 곳에서 export
export { default as ButtonRenderer } from "./ButtonRenderer";
export { default as TextRenderer } from "./TextRenderer";
export { default as LinkRenderer } from "./LinkRenderer";
export { default as AttendRenderer } from "./AttendRenderer";
export { default as ImageRenderer } from "./ImageRenderer";
export { default as DdayRenderer } from "./DdayRenderer";
export { default as WeddingContactRenderer } from "./WeddingContactRenderer";
export { default as GridGalleryRenderer } from "./GridGalleryRenderer";
export { default as SlideGalleryRenderer } from "./SlideGalleryRenderer";
export { default as MapView } from "./MapView";
export { default as MapInfoRenderer } from './MapInfoRenderer';
export { default as WeddingInviteRenderer } from './WeddingInviteRenderer';
export { default as CalendarRenderer } from './CalendarRenderer';
export { default as CommentRenderer } from './CommentRenderer';
export { default as BankAccountRenderer } from './BankAccountRenderer';

// 개별 import (getRendererByType 함수에서 사용)
import ButtonRenderer from "./ButtonRenderer";
import TextRenderer from "./TextRenderer";
import LinkRenderer from "./LinkRenderer";
import AttendRenderer from "./AttendRenderer";
import ImageRenderer from "./ImageRenderer";
import DdayRenderer from "./DdayRenderer";
import WeddingContactRenderer from "./WeddingContactRenderer";
import GridGalleryRenderer from "./GridGalleryRenderer";
import SlideGalleryRenderer from "./SlideGalleryRenderer";
import MapView from "./MapView";
import MapInfoRenderer from './MapInfoRenderer';
import WeddingInviteRenderer from './WeddingInviteRenderer';
import CalendarRenderer from './CalendarRenderer';
import CommentRenderer from './CommentRenderer';
import BankAccountRenderer from './BankAccountRenderer';

// 컴포넌트 타입별 렌더러 매핑 함수
export function getRendererByType(type: string) {
  switch (type) {
    case "button":
      return ButtonRenderer;
    case "text":
      return TextRenderer;
    case "link":
      return LinkRenderer;
    case "attend":
      return AttendRenderer;
    case "image":
      return ImageRenderer;
    case "map":
      return MapView;
    case "dday":
      return DdayRenderer;
    case "weddingContact":
      return WeddingContactRenderer;
    case "gridGallery":
      return GridGalleryRenderer;
    case "slideGallery":
      return SlideGalleryRenderer;
    case 'mapInfo':
      return MapInfoRenderer;
    case 'weddingInvite':
      return WeddingInviteRenderer;
    case 'calendar':
      return CalendarRenderer;
    case 'comment':
      return CommentRenderer;
    case 'bankAccount':
      return BankAccountRenderer;
    default:
      return null;
  }
}