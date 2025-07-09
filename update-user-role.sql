-- 계정 1@1을 ADMIN으로 업데이트하는 SQL 쿼리
UPDATE users 
SET role = 'ADMIN' 
WHERE email = '1@1';

-- 업데이트 확인
SELECT id, email, nickname, role, created_at 
FROM users 
WHERE email = '1@1'; 