-- Pages 테이블에 deployed_at 컬럼 추가 (MySQL)
ALTER TABLE pages ADD COLUMN deployed_at TIMESTAMP NULL;

-- 기존에 배포된 페이지들의 deployed_at을 updated_at으로 설정
UPDATE pages SET deployed_at = updated_at WHERE status = 'DEPLOYED'; 