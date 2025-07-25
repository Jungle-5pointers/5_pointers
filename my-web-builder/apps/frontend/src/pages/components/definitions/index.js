import buttonDef from "./button.json";
import textDef from "./text.json";
import linkDef from "./link.json";
import mapDef from "./map.json";
import attendDef from "./attend.json";
import imageDef from "./image.json";
import ddayDef from "./d-day.json";
import weddingContactDef from "./wedding-contact.json";
import gridGalleryDef from "./grid-gallery.json";
import slideGalleryDef from "./slide-gallery.json";
import mapInfoDef from './map_info.json';
import calendarDef from './calendar.json';
import bankAccount from './bank-account.json';
import commentDef from './comment.json';
import weddingInviteDef from './wedding-invite.json';
import musicDef from './music.json';
import slidoDef from './slido.json';
import kakaotalkShareDef from './kakaotalk-share.json';
import pageDef from "./page.json";
import pageButtonDef from "./pageButton.json";
import linkcopyDef from './linkcopy.json';
import rectangleLayerDef from './rectangle-layer.json';

export const ComponentList = [
  // 최하단 배치 (z-index가 0인 배경 레이어)
  rectangleLayerDef,   // 사각형 레이어
  
  // 상단 우선순위 컴포넌트들
  mapDef,           // 지도
  imageDef,         // 이미지
  ddayDef,          // d-day
  slideGalleryDef,  // 슬라이드 갤러리
  attendDef,        // 참석여부
  
  // 중간 랜덤 배치
  weddingContactDef,  // 연락처
  gridGalleryDef,     // 그리드 갤러리
  calendarDef,        // 캘린더
  bankAccount,        // 계좌 정보
  commentDef,         // 댓글
  slidoDef,           // 실시간 의견
  weddingInviteDef,   // 안내장
  musicDef,           // 음악
  mapInfoDef,         // 지도 정보
  kakaotalkShareDef,  // 카카오톡 
  linkcopyDef,        // 링크복사
  
  // 하단 기본 컴포넌트들
  buttonDef,        // 버튼
  textDef,          // 텍스트
  linkDef,           // 링크

  pageDef,          // 페이지 (최상단 배치)
  pageButtonDef,    // 페이지 버튼 (네비게이션 버튼)
];

// 기존 코드와의 호환성을 위해 ComponentDefinitions도 export
export const ComponentDefinitions = ComponentList;

// snapLine 타입 예시:
// {
//   x?: number,
//   y?: number,
//   type: 'align' | 'spacing' | 'grid',
//   spacing?: number
// }
