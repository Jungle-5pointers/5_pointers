# Elegant Wedding Invitation Template

## 개요
우아하고 로맨틱한 웨딩 초대장 템플릿입니다. 핑크, 로즈, 앰버 그라데이션을 사용하여 따뜻하고 사랑스러운 분위기를 연출합니다.

## 템플릿 구성 요소

### 1. 헤더 섹션 (Header)
- **컴포넌트**: `weddingInvite`
- **기능**: 메인 타이틀 "Wedding Invitation", 서브타이틀 "결혼합니다"
- **디자인**: 그라데이션 배경, 우아한 Playfair Display 폰트

### 2. 프로필 섹션 (Couple Profiles)
- **컴포넌트**: `text` (신랑), `text` (신부)
- **기능**: 신랑신부 이름, 부모님 성함, 생년월일
- **디자인**: 파란색(신랑), 핑크색(신부) 그라데이션 카드

### 3. 결혼식 일정 (Wedding Schedule)
- **컴포넌트**: `dday`, `text`
- **기능**: 결혼식 날짜, 시간 안내
- **디자인**: D-Day 카운터, 핑크 그라데이션 배경

### 4. 장소 안내 (Venue Information)
- **컴포넌트**: `mapInfo`
- **기능**: 예식장 이름, 주소, 교통편 안내
- **디자인**: 앰버-핑크 그라데이션 카드

### 5. 축하 메시지 (Wedding Message)
- **컴포넌트**: `text`
- **기능**: 결혼 인사말
- **디자인**: 반투명 흰색 배경, 이탤릭 인용구

### 6. 연락처 (Contact Information)
- **컴포넌트**: `weddingContact` (신랑측), `weddingContact` (신부측)
- **기능**: 양가 연락처 정보
- **디자인**: 파란색/핑크색 구분 카드

### 7. 푸터 (Footer)
- **컴포넌트**: `text`
- **기능**: 신랑신부 이름, "Forever & Always"
- **디자인**: 그라데이션 배경, 우아한 서체

### 8. 기능 컴포넌트들
- **참석 확인**: `attend` - RSVP 버튼
- **방명록**: `comment` - 축하 메시지 작성
- **축의금 안내**: `bankAccount` - 계좌 정보

## 설치 방법

### 방법 1: SQL 직접 실행
```sql
-- PostgreSQL 데이터베이스에서 실행
\i elegant_wedding_template.sql
```

### 방법 2: API를 통한 생성
```bash
# Node.js 스크립트 실행
node create_elegant_wedding_template.js
```

**주의**: API 방법을 사용할 경우 `create_elegant_wedding_template.js` 파일에서 `YOUR_ADMIN_TOKEN_HERE`를 실제 관리자 토큰으로 교체해야 합니다.

## 디자인 특징

### 색상 팔레트
- **주요 색상**: 로즈 핑크 (#be185d), 소프트 핑크 (#fce7f3)
- **보조 색상**: 앰버 (#fef3c7), 블루 (#dbeafe)
- **텍스트**: 다크 그레이 (#1f2937), 미디엄 그레이 (#6b7280)

### 타이포그래피
- **헤더**: Playfair Display (우아한 세리프)
- **본문**: Noto Sans KR (한글 최적화)
- **크기**: 제목 24-28px, 본문 14-16px

### 레이아웃
- **폭**: 375px (모바일 최적화)
- **높이**: 약 1570px (스크롤 가능)
- **여백**: 20px 좌우 여백
- **카드**: 16px 모서리 둥글게

## 커스터마이징 가이드

### 텍스트 수정
1. 신랑신부 이름: `groom-profile-1`, `bride-profile-1` 컴포넌트
2. 날짜/시간: `wedding-datetime-1` 컴포넌트
3. 장소: `wedding-venue-1` 컴포넌트
4. 연락처: `groom-contact-1`, `bride-contact-1` 컴포넌트

### 색상 변경
- 각 컴포넌트의 `backgroundColor`, `textColor` 속성 수정
- 일관된 색상 테마 유지 권장

### 레이아웃 조정
- 컴포넌트의 `x`, `y`, `width`, `height` 속성으로 위치/크기 조정
- 모바일 최적화를 위해 375px 폭 기준 권장

## 사용법

1. **템플릿 선택**: NoCodeEditor에서 "Elegant Wedding Invitation" 템플릿 선택
2. **내용 수정**: 각 컴포넌트 선택 후 Properties 패널에서 내용 수정
3. **디자인 조정**: 색상, 폰트, 레이아웃 등 필요에 따라 조정
4. **배포**: 완성 후 서브도메인으로 배포

## 호환성
- **모바일**: 375px 기준 최적화
- **태블릿/데스크탑**: 반응형 지원
- **브라우저**: 모든 모던 브라우저 지원

## 라이선스
이 템플릿은 웨딩 초대장 제작 목적으로 자유롭게 사용 가능합니다.