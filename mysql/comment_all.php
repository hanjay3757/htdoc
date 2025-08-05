<?php
include 'db.php';

// 게시글 ID 받아오기 (예: 게시글 클릭 시 ?id=3)
$board_id = $_GET['id'] ?? 1;

// 게시글 내용 출력
$sql = "SELECT * FROM board WHERE id = :id";
$stmt = $conn->prepare($sql);
$stmt->bindParam(':id', $board_id);
$stmt->execute();
$post = $stmt->fetch();

echo "<h2>{$post['subject']}</h2>";
echo "<p>{$post['content']}</p>";
echo "<hr>";

// 댓글 출력
$sql = "SELECT * FROM comment WHERE board_id = :board_id ORDER BY parent_id ASC, id ASC";
$stmt = $conn->prepare($sql);
$stmt->bindParam(':board_id', $board_id);
$stmt->execute();
$comments = $stmt->fetchAll();

function renderComments($comments, $parent_id = null, $depth = 0) {
    foreach ($comments as $comment) {
        if ($comment['parent_id'] == $parent_id) {
            echo str_repeat("&nbsp;&nbsp;", $depth * 4);  // 들여쓰기
            echo "<p><strong>{$comment['writer']}</strong>: {$comment['content']}</p>";

            // 대댓글 입력 폼
            echo '<form method="post" action="comment_ok.php">';
            echo '<input type="hidden" name="board_id" value="'.$comment['board_id'].'">';
            echo '<input type="hidden" name="parent_id" value="'.$comment['id'].'">';
            echo '<input type="text" name="writer" placeholder="작성자">';
            echo '<input type="text" name="content" placeholder="대댓글">';
            echo '<input type="submit" value="대댓글">';
            echo '</form>';

            renderComments($comments, $comment['id'], $depth + 1);
        }
    }
}

echo "<h3>댓글</h3>";
renderComments($comments);

// 댓글 최초 작성 폼 (대댓글이 아님)
echo '<h4>댓글 작성</h4>';
echo '<form method="post" action="comment_ok.php">';
echo '<input type="hidden" name="board_id" value="'.$board_id.'">';
echo '<input type="hidden" name="parent_id" value="">'; // 최상위 댓글
echo '<input type="text" name="writer" placeholder="작성자">';
echo '<input type="text" name="content" placeholder="댓글">';
echo '<input type="submit" value="댓글 작성">';
echo '</form>';
?>
