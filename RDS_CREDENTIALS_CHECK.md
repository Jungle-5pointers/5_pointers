# 🔑 RDS 사용자 정보 확인 가이드

## 현재 상황
✅ **보안 그룹 설정 성공** - 네트워크 연결 정상
❌ **인증 실패** - 사용자명/비밀번호 불일치

## 🔍 AWS 콘솔에서 RDS 정보 확인

### 1단계: RDS 인스턴스 정보 확인
1. **AWS 콘솔** → **RDS** → **데이터베이스**
2. **pointers-mysql-db** 클릭
3. **구성** 탭에서 확인할 정보:
   ```
   마스터 사용자 이름: [확인 필요]
   엔드포인트: pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com
   포트: 3306
   ```

### 2단계: 일반적인 RDS 사용자명
- `admin` (AWS RDS 기본값)
- `root` (MySQL 기본값)
- `mysql`
- `dbadmin`
- 사용자 정의 이름

### 3단계: 비밀번호 확인/재설정
만약 비밀번호를 모른다면:
1. **RDS 인스턴스 선택** → **수정**
2. **새 마스터 암호** 설정
3. **즉시 적용** 체크
4. **DB 인스턴스 수정** 클릭

## 🧪 다양한 사용자명으로 테스트

### 테스트할 사용자명 목록:
1. `admin` (가장 가능성 높음)
2. `root`
3. `mysql`
4. `dbadmin`
5. `jungle` (프로젝트명 기반)

### 테스트할 비밀번호 패턴:
1. `admin123!`
2. `12345678`
3. `password`
4. `jungle123!`
5. `admin`

## 🔧 GitHub Secrets 설정 준비

올바른 사용자명/비밀번호 확인 후 GitHub에 설정:

```
DB_HOST=pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=[확인된_사용자명]
DB_PASSWORD=[확인된_비밀번호]
DB_DATABASE=jungle
JWT_SECRET=[32자리_랜덤_문자열]
```

## 📞 비밀번호 재설정 방법

### AWS 콘솔에서 재설정:
1. **RDS** → **pointers-mysql-db** → **수정**
2. **데이터베이스 옵션** 섹션
3. **새 마스터 암호** 체크
4. 새 비밀번호 입력 (예: `NewPassword123!`)
5. **즉시 적용** 선택
6. **DB 인스턴스 수정** 클릭
7. 5-10분 대기 후 새 비밀번호로 테스트
