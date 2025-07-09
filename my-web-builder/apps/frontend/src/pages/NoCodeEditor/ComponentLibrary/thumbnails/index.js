import ButtonThumbnail from './ButtonThumbnail';
import TextThumbnail from './TextThumbnail';
import LinkThumbnail from './LinkThumbnail';
import AttendThumbnail from './AttendThumbnail';
import DdayThumbnail from './DdayThumbnail';
import CalendarThumbnail from './CalendarThumbnail';
import BankAccountThumbnail from './BankAccountThumbnail';
import CommentThumbnail from './CommentThumbnail';
import ImageThumbnail from './ImageThumbnail';
import MapThumbnail from './MapThumbnail';
import WeddingContactThumbnail from './WeddingContactThumbnail';
import DefaultThumbnail from './DefaultThumbnail';
import GridGalleryThumbnail from './GridGalleryThumbnail';
import SlideGalleryThumbnail from './SlideGalleryThumbnail';
import MusicThumbnail from './MusicThumbnail';
import WeddingInviteThumbnail from './WeddingInviteThumbnail';

export const ThumbnailComponents = {
  button: ButtonThumbnail,
  text: TextThumbnail,
  link: LinkThumbnail,
  attend: AttendThumbnail,
  dday: DdayThumbnail,
  'd-day': DdayThumbnail, // kebab-case alias
  calendar: CalendarThumbnail,
  bankAccount: BankAccountThumbnail,
  'bank-account': BankAccountThumbnail, // kebab-case alias
  comment: CommentThumbnail,
  image: ImageThumbnail,
  map: MapThumbnail,
  mapInfo: MapThumbnail, // map_info uses same thumbnail
  'map_info': MapThumbnail, // underscore alias
  weddingContact: WeddingContactThumbnail,
  'wedding-contact': WeddingContactThumbnail, // kebab-case alias
  weddingInvite: WeddingInviteThumbnail, // 실제 렌더러 기반 썸네일
  'wedding-invite': WeddingInviteThumbnail, // kebab-case alias
  gridGallery: GridGalleryThumbnail, // 전용 그리드 갤러리 썸네일
  'grid-gallery': GridGalleryThumbnail, // kebab-case alias
  slideGallery: SlideGalleryThumbnail, // 전용 슬라이드 갤러리 썸네일
  'slide-gallery': SlideGalleryThumbnail, // kebab-case alias
  music: MusicThumbnail, // 전용 음악 플레이어 썸네일
  musicPlayer: MusicThumbnail, // 음악 플레이어 컴포넌트
  default: DefaultThumbnail
};

export {
  ButtonThumbnail,
  TextThumbnail,
  LinkThumbnail,
  AttendThumbnail,
  DdayThumbnail,
  CalendarThumbnail,
  BankAccountThumbnail,
  CommentThumbnail,
  ImageThumbnail,
  MapThumbnail,
  WeddingContactThumbnail,
  DefaultThumbnail,
  GridGalleryThumbnail,
  SlideGalleryThumbnail,
  MusicThumbnail,
  WeddingInviteThumbnail
};
