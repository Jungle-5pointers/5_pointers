# 🔧 AWS 보안 그룹 규칙 오류 해결

## 오류 상황
```
기존 참조된 그룹 ID 규칙에 an IPv4 CIDR을(를) 지정할 수 없습니다.
```

## 원인
- 기존 인바운드 규칙이 보안 그룹 ID (sg-xxxxxxxxx)로 설정되어 있음
- 같은 규칙에 IP 주소 (CIDR)를 추가하려고 해서 충돌 발생

## 🔧 해결 방법

### 방법 1: 기존 규칙 삭제 후 새로 생성 (권장)

1. **AWS RDS 콘솔** → **pointers-mysql-db** → **연결 및 보안**
2. **VPC 보안 그룹** 클릭
3. **인바운드 규칙** 탭 선택
4. **기존 MySQL/Aurora 규칙 모두 삭제**
   - 각 규칙 옆의 ❌ 버튼 클릭
   - "삭제" 확인
5. **새 규칙 추가**:
   
   **규칙 1:**
   ```
   유형: MySQL/Aurora
   포트: 3306
   소스: 사용자 지정 → 1.238.129.195/32
   설명: Developer Access
   ```
   
   **규칙 2:**
   ```
   유형: MySQL/Aurora
   포트: 3306
   소스: 사용자 지정 → 3.39.235.190/32
   설명: Backend Server Access
   ```

6. **규칙 저장** 클릭

### 방법 2: 별도 규칙으로 추가

기존 규칙을 유지하고 새로운 규칙을 별도로 추가:

1. **규칙 추가** 클릭
2. **유형**: MySQL/Aurora
3. **소스**: 사용자 지정
4. **CIDR 블록**: `1.238.129.195/32`
5. **설명**: `Developer IP Access`
6. **다른 규칙 추가** 반복:
   - CIDR 블록: `3.39.235.190/32`
   - 설명: `Backend Server Access`

## 🔍 현재 규칙 확인 방법

### 기존 규칙이 어떻게 설정되어 있는지 확인:

1. **인바운드 규칙** 탭에서 현재 MySQL/Aurora 규칙 확인
2. **소스** 컬럼 확인:
   - `sg-xxxxxxxxx` 형태 → 보안 그룹 ID 참조
   - `0.0.0.0/0` 형태 → IP 주소 범위
   - `xxx.xxx.xxx.xxx/32` 형태 → 특정 IP 주소

## 📋 권장 최종 설정

### 인바운드 규칙 (MySQL/Aurora 포트 3306):
```
규칙 1:
- 소스: 1.238.129.195/32
- 설명: Developer Access for Testing

규칙 2:  
- 소스: 3.39.235.190/32
- 설명: Backend Server Access (Primary)
```

### 기존 보안 그룹 참조 규칙:
- 필요하지 않다면 삭제 권장
- 필요하다면 별도 유지하고 IP 규칙 추가

## 🚨 주의사항

1. **규칙 삭제 시**: 기존 연결이 일시적으로 끊어질 수 있음
2. **테스트 필수**: 규칙 변경 후 반드시 연결 테스트
3. **백업**: 기존 규칙 설정을 스크린샷으로 백업

## ✅ 설정 완료 후 테스트

```bash
# RDS 연결 테스트
node test-rds-connection-detailed.js

# 성공 시 백엔드 재배포
echo "RDS Security Group Fixed: $(date)" >> backend/DEPLOYMENT_TRIGGER.md
git add backend/DEPLOYMENT_TRIGGER.md
git commit -m "🔒 Trigger deployment after RDS security group fix"
git push origin main
```
