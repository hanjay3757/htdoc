<?php
session_start();
include("dbcon.php");
include("utils/media_handler.php");

if (isset($_POST["comment_load_data"])) {
    $user_id = isset($_SESSION['auth_user_id']) ? $_SESSION['auth_user_id'] : 0;

    // 댓글과 좋아요 정보, 미디어 파일을 함께 가져오기
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
            // 각 댓글의 미디어 파일 가져오기
            $media_query = "SELECT * FROM comment_media WHERE comment_id = " . $row['id'];
            $media_result = mysqli_query($con, $media_query);
            $media_files = [];

            if (mysqli_num_rows($media_result) > 0) {
                while ($media_row = mysqli_fetch_assoc($media_result)) {
                    // 디버깅: 미디어 파일 경로 확인
                    error_log("DB에서 가져온 미디어 파일 정보: " . print_r($media_row, true));
                    $media_files[] = $media_row;
                }
            }

            $row['media_files'] = $media_files;
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
    // 디버깅 로그 시작
    error_log("=== 댓글 추가 요청 시작 ===");
    error_log("POST 데이터: " . print_r($_POST, true));
    error_log("FILES 데이터: " . print_r($_FILES, true));
    error_log("세션 데이터: " . print_r($_SESSION, true));

    $msg = mysqli_real_escape_string($con, $_POST['msg']);
    $user_id = $_SESSION['auth_user_id'];
    $parent_id = isset($_POST['parent_id']) ? (int)$_POST['parent_id'] : 0;

    error_log("처리된 데이터 - msg: '$msg', user_id: '$user_id', parent_id: '$parent_id'");

    if (empty(trim($msg)) && empty($_FILES['media_files']['name'][0])) {
        error_log("에러: 댓글 내용이나 파일이 없음");
        echo json_encode(['error' => '댓글 내용이나 파일을 입력해주세요.']);
        exit;
    }

    if (empty($user_id)) {
        error_log("에러: 사용자 ID가 없음");
        echo json_encode(['error' => '로그인이 필요합니다.']);
        exit;
    }

    // 미디어 파일이 있는지 확인
    $has_media = !empty($_FILES['media_files']['name'][0]) ? 1 : 0;
    error_log("미디어 파일 여부: " . $has_media);

    // 댓글 추가
    $comment_add_query = "INSERT INTO comments (user_id, msg, parent_id, has_media) VALUES ('$user_id', '$msg', '$parent_id', '$has_media')";
    error_log("댓글 추가 쿼리: " . $comment_add_query);

    $comment_add_query_run = mysqli_query($con, $comment_add_query);

    if ($comment_add_query_run) {
        $comment_id = mysqli_insert_id($con);
        error_log("댓글 추가 성공, comment_id: " . $comment_id);

        // 미디어 파일 처리
        if ($has_media) {
            error_log("미디어 파일 처리 시작");

            try {
                $media_handler = new MediaHandler();
                error_log("MediaHandler 생성 성공");

                $upload_result = $media_handler->uploadFiles($_FILES['media_files']);
                error_log("업로드 결과: " . print_r($upload_result, true));

                if ($upload_result['success']) {
                    error_log("파일 업로드 성공, DB 저장 시작");
                    // 데이터베이스에 미디어 파일 정보 저장
                    foreach ($upload_result['files'] as $file) {
                        error_log("파일 정보 저장: " . print_r($file, true));

                        $insert_media = "INSERT INTO comment_media (comment_id, file_name, original_name, file_type, file_size, file_path, thumbnail_path, mime_type) 
                                        VALUES ('$comment_id', '" . mysqli_real_escape_string($con, $file['filename']) . "', 
                                               '" . mysqli_real_escape_string($con, $file['original_name']) . "', 
                                               '" . $file['file_type'] . "', '" . $file['file_size'] . "', 
                                               '" . mysqli_real_escape_string($con, $file['file_path']) . "', 
                                               '" . mysqli_real_escape_string($con, $file['thumbnail_path']) . "', 
                                               '" . mysqli_real_escape_string($con, $file['mime_type']) . "')";

                        error_log("미디어 DB 저장 쿼리: " . $insert_media);

                        $media_result = mysqli_query($con, $insert_media);
                        if (!$media_result) {
                            error_log("미디어 DB 저장 실패: " . mysqli_error($con));
                            echo json_encode(['error' => '미디어 DB 저장 실패: ' . mysqli_error($con)]);
                            exit;
                        }
                        error_log("미디어 파일 DB 저장 성공");
                    }
                    error_log("모든 처리 완료");
                    echo json_encode(['success' => '댓글이 성공적으로 추가되었습니다!']);
                } else {
                    error_log("파일 업로드 실패");
                    echo json_encode(['error' => '파일 업로드 실패: ' . implode(', ', $upload_result['errors'])]);
                }
            } catch (Exception $e) {
                error_log("예외 발생: " . $e->getMessage());
                echo json_encode(['error' => '시스템 오류: ' . $e->getMessage()]);
            }
        } else {
            error_log("미디어 파일 없음, 댓글만 저장");
            echo json_encode(['success' => '댓글이 성공적으로 추가되었습니다!']);
        }
    } else {
        error_log("댓글 추가 실패: " . mysqli_error($con));
        echo json_encode(['error' => '댓글 추가 실패: ' . mysqli_error($con)]);
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
