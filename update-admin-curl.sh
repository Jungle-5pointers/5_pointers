#!/bin/bash

# 계정 1@1을 ADMIN으로 업데이트하는 cURL 스크립트

# 개발 환경
API_URL="http://localhost:3000/users/update-role"

# 프로덕션 환경 (필요시 주석 해제)
# API_URL="http://your-production-domain.com/users/update-role"

echo "🔄 계정 1@1을 ADMIN으로 업데이트 중..."

curl -X PATCH "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "1@1",
    "role": "ADMIN"
  }'

echo ""
echo "✅ 업데이트 완료!" 