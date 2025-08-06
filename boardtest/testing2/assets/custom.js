$(document).ready(function () {
  
    load_comment();
    
    function load_comment() {
        $.ajax({
            type: "POST",
            url: "code.php",
            data: {
                'comment_load_data' : true
            },
            dataType: "json",
            success: function (response) {
                $('.comment-container').html("");
                
                // 에러가 있는지 확인
                if (response.error) {
                    $('.comment-container').html('<p class="text-danger">Error: ' + response.error + '</p>');
                    return;
                }
                
                if (response.length > 0) {
                    // 재귀적으로 댓글 트리 렌더링
                    function renderCommentTree(comments, depth = 0) {
                        var html = '';
                        $.each(comments, function(key, comment) {
                            var marginLeft = depth * 30; // depth에 따른 들여쓰기
                            var depthClass = 'depth-' + depth;
                            var borderColor = depth > 0 ? 'border-left border-primary' : 'border';
                            
                            html += '<div class="' + borderColor + ' p-2 mb-1 comment-box ' + depthClass + '" style="margin-left: ' + marginLeft + 'px;" data-comment-id="' + comment.id + '" data-depth="' + depth + '">\
                                <h6 class="border-bottom d-inline">' + (comment.fullname || 'Unknown User') + '</h6>\
                                <small class="text-muted"> - ' + comment.created_at + ' (depth: ' + depth + ')</small>\
                                <p class="para">' + comment.msg + '</p>\
                                <button class="badge btn-warning reply_btn" data-comment-id="' + comment.id + '" data-depth="' + depth + '">답글</button>';
                            
                            if (comment.children && comment.children.length > 0) {
                                html += '<button class="badge btn-info toggle_children_btn" data-comment-id="' + comment.id + '">답글 보기 (' + comment.children.length + ')</button>';
                            }
                            
                            html += '<div class="reply_section mt-2"></div>';
                            
                            if (comment.children && comment.children.length > 0) {
                                html += '<div class="children-container" id="children-' + comment.id + '">';
                                html += renderCommentTree(comment.children, depth + 1);
                                html += '</div>';
                            }
                            
                            html += '</div>';
                        });
                        return html;
                    }
                    
                    $('.comment-container').html(renderCommentTree(response));
                } else {
                    $('.comment-container').html('<p class="text-muted">댓글이 없습니다.</p>');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error loading comments:', error);
                console.error('Status:', status);
                console.error('Response:', xhr.responseText);
                $('.comment-container').html('<p class="text-danger">Error loading comments. Please check the console for details.</p>');
            }
        });
    }
    
    $(document).on('click', '.reply_btn', function () {
        var thisClicked = $(this);
        var cmt_id = thisClicked.data('comment-id');
        var currentDepth = parseInt(thisClicked.data('depth'));
        var replySection = thisClicked.closest('.comment-box').find('.reply_section');
        
        // 다른 모든 reply_section을 비우기
        $('.reply_section').html('');
        
        // 현재 댓글의 reply_section에 입력 폼 추가
        replySection.html('<input type="text" class="reply_msg form-control my-2" placeholder="답글을 입력하세요...">\
                    <div class="text-end pr-2">\
                        <button class="btn btn-sm btn-primary reply_add_btn" data-parent-id="' + cmt_id + '" data-depth="' + (currentDepth + 1) + '">답글 달기</button>\
                        <button class="btn btn-sm btn-secondary reply_cancel_btn">취소</button>\
                    </div>');
    });
    
    $(document).on('click', '.reply_cancel_btn', function () {
        $(this).closest('.reply_section').html('');
    });
    
    $(document).on('click', '.reply_add_btn', function (e) {
        e.preventDefault();
        var thisClicked = $(this);
        var parent_id = thisClicked.data('parent-id');
        var depth = thisClicked.data('depth');
        var reply = thisClicked.closest('.reply_section').find('.reply_msg').val();

        if ($.trim(reply).length == 0) {
            alert("답글을 입력해주세요");
            return false;
        }

        var data = {
            'parent_id': parent_id,
            'msg': reply,
            'add_comment': true  
        };
        $.ajax({
            type: "POST",
            url: "code.php", 
            data: data,
            success: function (response) {
                alert(response);
                thisClicked.closest('.reply_section').html(''); // 입력 폼 비우기
                load_comment(); // 댓글 추가 후 목록 새로고침
            },
            error: function(xhr, status, error) {
                alert('답글 추가 실패: ' + error);
            }
        });
    });
    
    // 자식 댓글 토글 기능
    $(document).on('click', '.toggle_children_btn', function () {
        var thisClicked = $(this);
        var commentId = thisClicked.data('comment-id');
        var childrenContainer = $('#children-' + commentId);
        
        if (childrenContainer.is(':visible')) {
            childrenContainer.hide();
            thisClicked.text('답글 보기 (' + childrenContainer.find('.comment-box').length + ')');
        } else {
            childrenContainer.show();
            thisClicked.text('답글 숨기기');
        }
    });
    
    $('.add_comment_btn').click(function (e) {
        e.preventDefault();

        var msg = $('.comment_textbox').val();
        if ($.trim(msg).length == 0) {
            error_msg = "please enter a comment";
            $('#error_status').text(error_msg);
            return false;
        } else {
            error_msg = "";
            $('#error_status').text(error_msg);
        }
        
        var data = {
            'msg': msg,
            'parent_id': 0, // 메인 댓글은 parent_id가 0
            'add_comment' : true,
        };
        
        $.ajax({
            type: "POST",
            url: "code.php",
            data: data,
            success: function (response) {
                alert(response);
                $('.comment_textbox').val('');
                load_comment(); // 댓글 추가 후 목록 새로고침
            },
            error: function(xhr, status, error) {
                alert('댓글 추가 실패: ' + error);
            }
        });
    });

});