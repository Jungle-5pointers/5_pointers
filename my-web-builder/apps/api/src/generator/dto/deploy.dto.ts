/**
 * 배포 요청 데이터 전송 객체 (DTO)
 * 프론트엔드에서 백엔드로 전송되는 배포 요청 데이터 구조
 */
export class DeployDto {
  /** 배포할 프로젝트(페이지) ID - roomId와 동일 */
  projectId: string;
  
  /** 배포를 요청한 사용자 ID - 서브도메인 생성에 사용 */
  userId: string;
  
  /** 노코드 에디터에서 생성된 컴포넌트 배열 - HTML로 변환될 데이터 */
  components: any[];
  
  /** 사용자가 입력한 도메인 이름 (선택사항) */
  domain?: string;
}