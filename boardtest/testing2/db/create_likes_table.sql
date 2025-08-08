-- 댓글 좋아요 테이블 생성
CREATE TABLE comment_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 댓글 테이블에 좋아요 수 컬럼 추가 (선택사항 - 성능 최적화용)
ALTER TABLE comments ADD COLUMN likes_count INT DEFAULT 0;

-- 기존 댓글들의 likes_count 초기화
-- UPDATE comments SET likes_count = 0;
