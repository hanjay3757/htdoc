<?php
session_start();
include("dbcon.php");

if (isset($_POST["comment_load_data"])) {
    $user_id = isset($_SESSION['auth_user_id']) ? $_SESSION['auth_user_id'] : 0;

    // 댓글과 좋아요 정보를 함께 가져오기
    $comments_query = "SELECT c.*, u.fullname, c.likes_count,
                       CASE WHEN cl.user_id IS NOT NULL THEN 1 ELSE 0 END as user_liked
                       FROM comments c 
                       LEFT JOIN users u ON c.user_id = u.id 
                       LEFT JOIN comment_likes cl ON c.id = cl.comment_id AND cl.user_id = '$user_id'
                       ORDER BY c.parent_id ASC, c.id ASC";
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

// 좋아요 토글 기능
if (isset($_POST['toggle_like'])) {
    $comment_id = (int)$_POST['comment_id'];
    $user_id = $_SESSION['auth_user_id'];

    if (empty($user_id)) {
        echo json_encode(['error' => 'User not logged in']);
        exit;
    }

    // 현재 좋아요 상태 확인
    $check_like = "SELECT id FROM comment_likes WHERE comment_id = '$comment_id' AND user_id = '$user_id'";
    $check_result = mysqli_query($con, $check_like);

    if (mysqli_num_rows($check_result) > 0) {
        // 좋아요 제거
        $delete_like = "DELETE FROM comment_likes WHERE comment_id = '$comment_id' AND user_id = '$user_id'";
        mysqli_query($con, $delete_like);

        // 좋아요 수 감소
        $update_count = "UPDATE comments SET likes_count = likes_count - 1 WHERE id = '$comment_id'";
        mysqli_query($con, $update_count);

        $liked = false;
    } else {
        // 좋아요 추가
        $add_like = "INSERT INTO comment_likes (comment_id, user_id) VALUES ('$comment_id', '$user_id')";
        mysqli_query($con, $add_like);

        // 좋아요 수 증가
        $update_count = "UPDATE comments SET likes_count = likes_count + 1 WHERE id = '$comment_id'";
        mysqli_query($con, $update_count);

        $liked = true;
    }

    // 현재 좋아요 수 가져오기
    $get_count = "SELECT likes_count FROM comments WHERE id = '$comment_id'";
    $count_result = mysqli_query($con, $get_count);
    $count_row = mysqli_fetch_assoc($count_result);

    header('Content-Type: application/json');
    echo json_encode([
        'liked' => $liked,
        'likes_count' => (int)$count_row['likes_count']
    ]);
}
