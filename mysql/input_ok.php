<?php
include 'db.php';

$subject = $_POST['subject'] ?? '';
$content = $_POST['content'] ?? '';

print_r($_POST); // 디버깅용. 실제 배포 시엔 지워도 됨

try {
    $sql = "INSERT INTO board (subject, content, rdate) VALUES (:subject, :content, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':subject', $subject);
    $stmt->bindParam(':content', $content);
    $stmt->execute();

    echo "게시물이 등록되었습니다.";
} catch(PDOException $e) {
    echo "게시물 등록 실패: " . $e->getMessage();
    exit();
}
?>
