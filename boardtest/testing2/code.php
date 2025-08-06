<?php
session_start();
include("dbcon.php");
if (isset($_POST["comment_load_data"])) {

    $comments_query = "SELECT c.*, u.fullname FROM comments c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.id DESC";
    $comments_query_run = mysqli_query($con, $comments_query);

    $array_result = [];

    if (mysqli_num_rows($comments_query_run) > 0) {
        foreach ($comments_query_run as $row) {
            array_push($array_result, $row);
        }
        header('Content-Type: application/json');
        echo json_encode($array_result);
    } else {
        header('Content-Type: application/json');
        echo json_encode([]);
    }
}

if (isset($_POST['add_comment'])) {
    $msg = mysqli_real_escape_string($con, $_POST['msg']);
    $user_id = $_SESSION['auth_user_id'];

    $comment_add_query = "INSERT INTO comments (user_id, msg) VALUES ('$user_id', '$msg')";
    $comment_add_query_run = mysqli_query($con, $comment_add_query);

    if ($comment_add_query_run) {
        echo "Comment added successfully!";
    } else {
        echo "Failed to add comment.";
    }
}
