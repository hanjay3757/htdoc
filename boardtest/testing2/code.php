<?php
session_start();
include("dbcon.php");

if (isset($_POST["comment_load_data"])) {
    $comments_query = "SELECT c.*, u.fullname FROM comments c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.parent_id ASC, c.id ASC";
    $comments_query_run = mysqli_query($con, $comments_query);

    $array_result = [];
    $comment_tree = [];

    if (mysqli_num_rows($comments_query_run) > 0) {
        $all_comments = [];
        while ($row = mysqli_fetch_assoc($comments_query_run)) {
            $all_comments[] = $row;
        }

        // 계층 구조 생성 함수
        function buildCommentTree($comments, $parent_id = 0, $depth = 0)
        {
            $tree = [];
            foreach ($comments as $comment) {
                if ($comment['parent_id'] == $parent_id) {
                    $comment['depth'] = $depth;
                    $comment['children'] = buildCommentTree($comments, $comment['id'], $depth + 1);
                    $tree[] = $comment;
                }
            }
            return $tree;
        }

        $comment_tree = buildCommentTree($all_comments);
        header('Content-Type: application/json');
        echo json_encode($comment_tree);
    } else {
        header('Content-Type: application/json');
        echo json_encode([]);
    }
}

if (isset($_POST['add_comment'])) {
    $msg = mysqli_real_escape_string($con, $_POST['msg']);
    $user_id = $_SESSION['auth_user_id'];
    $parent_id = isset($_POST['parent_id']) ? (int)$_POST['parent_id'] : 0;

    if (empty(trim($msg))) {
        echo "Comment message cannot be empty.";
        exit;
    }

    if (empty($user_id)) {
        echo "User not logged in.";
        exit;
    }

    $comment_add_query = "INSERT INTO comments (user_id, msg, parent_id) VALUES ('$user_id', '$msg', '$parent_id')";
    $comment_add_query_run = mysqli_query($con, $comment_add_query);

    if ($comment_add_query_run) {
        echo "Comment added successfully!";
    } else {
        echo "Failed to add comment: " . mysqli_error($con);
    }
}
