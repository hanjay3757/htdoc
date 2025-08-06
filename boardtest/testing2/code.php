<?php
session_start();
include("dbcon.php");


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
