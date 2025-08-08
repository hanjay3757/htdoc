-- 댓글 테이블에 미디어 파일 지원 컬럼 추가 (존재하지 않을 때만)
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS media_files TEXT NULL COMMENT '업로드된 미디어 파일들 (JSON 형식)',
ADD COLUMN IF NOT EXISTS has_media TINYINT(1) DEFAULT 0 COMMENT '미디어 파일 포함 여부';

-- 미디어 파일 정보를 저장할 별도 테이블 생성 (존재하지 않을 때만)
CREATE TABLE IF NOT EXISTS comment_media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type ENUM('image', 'video', 'gif') NOT NULL,
    file_size INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500) NULL,
    mime_type VARCHAR(100) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- 인덱스 추가 (존재하지 않을 때만)
CREATE INDEX IF NOT EXISTS idx_comment_media_comment_id ON comment_media(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_media_file_type ON comment_media(file_type);
