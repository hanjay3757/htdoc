<?php
include 'db.php';

$board_id = $_POST['board_id'];
$parent_id = $_POST['parent_id'] ?: null;  // 없으면 null
$content = $_POST['content'];
$writer = $_POST['writer'];

try {
    $sql = "INSERT INTO comment (board_id, parent_id, content, writer, rdate)
            VALUES (:board_id, :parent_id, :content, :writer, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':board_id', $board_id);
    $stmt->bindParam(':parent_id', $parent_id);
    $stmt->bindParam(':content', $content);
    $stmt->bindParam(':writer', $writer);
    $stmt->execute();

    echo "댓글이 등록되었습니다.";
} catch (PDOException $e) {
    echo "댓글 등록 실패: " . $e->getMessage();
}
?>
