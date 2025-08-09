-- users 테이블에 프로필 이미지 컬럼 추가
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500) NULL COMMENT '프로필 이미지 파일 경로',
ADD COLUMN IF NOT EXISTS profile_image_updated_at TIMESTAMP NULL COMMENT '프로필 이미지 업데이트 시간';

-- 프로필 이미지 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_profile_image ON users(profile_image);
