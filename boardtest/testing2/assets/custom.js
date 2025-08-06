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
                if (response.length > 0) {
                    $.each(response, function(key, value) {
                        $('.comment-container').append('<div class="border p-2 mb-2">\
                            <h6 class="border-bottom d-inline">' + (value.fullname || 'Unknown User') + '</h6>\
                            <p class="para">' + value.msg + '</p>\
                            <small class="text-muted">' + value.created_at + '</small>\
                            <button class="badge btn-warning reply_btn">reply</button>\
                            <button class="badge btn-danger view_reply_btn">view replies</button>\
                            <div class="ml-4 reply_section"></div>\
                        </div>');
                    });
                } else {
                    $('.comment-container').html('<p class="text-muted">No comments yet.</p>');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error loading comments:', error);
                $('.comment-container').html('<p class="text-danger">Error loading comments.</p>');
            }
        });
    }
    
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