$(document).ready(function () {
  load_comment();

  function load_comment() {
    $.ajax({
      type: "POST",
      url: "code.php",
      data: {
        comment_load_data: true,
      },
      dataType: "json",
      success: function (response) {
        $(".comment-container").html("");

        if (response.error) {
          $(".comment-container").html(
            '<p class="text-danger">Error: ' + response.error + "</p>"
          );
          return;
        }

        if (response.length > 0) {
          function renderCommentTree(comments, depth = 0) {
            var html = "";
            $.each(comments, function (key, comment) {
              var depthClass = "depth-" + depth;

              html +=
                '<div class="comment-box ' +
                depthClass +
                '" data-comment-id="' +
                comment.id +
                '" data-depth="' +
                depth +
                '">\
    <div class="comment-header ">\
        <div>\
            <h6 class="d-inline mb-0">' +
                (comment.fullname || "Unknown User") +
                '</h6>\
            <small class="text-muted ms-2">' +
                comment.created_at +
                '</small>\
        </div>\
        <div class="comment-buttons">\
            <button class="btn btn-sm btn-outline-warning reply_btn" data-comment-id="' +
                comment.id +
                '" data-depth="' +
                depth +
                '">답글</button>';

              if (comment.children && comment.children.length > 0) {
                html +=
                  '<button class=" btn btn-sm btn-outline-info toggle_children_btn" data-comment-id="' +
                  comment.id +
                  '">답글 보기 (' +
                  comment.children.length +
                  ")</button>";
              }

              html +=
                '</div>\
    </div>\
    <p class="para mt-2 mb-1">' +
                comment.msg +
                "</p>";
              
              // 좋아요 버튼 추가
              var likedClass = comment.user_liked == 1 ? 'liked' : '';
              var heartIcon = comment.user_liked == 1 ? '❤️' : '🤍';
              html += '<div class="like-section mt-2 mb-2">\
                        <button class="like-btn ' + likedClass + '" data-comment-id="' + comment.id + '">\
                          <span class="heart-icon">' + heartIcon + '</span>\
                          <span class="like-count">' + (comment.likes_count || 0) + '</span>\
                        </button>\
                      </div>';
              
              html += '<div class="reply_section mt-2"></div>';

              if (comment.children && comment.children.length > 0) {
                html +=
                  '<div class="children-container" id="children-' +
                  comment.id +
                  '">';
                html += renderCommentTree(comment.children, depth + 1);
                html += "</div>";
              }

              html += "</div>";
            });
            return html;
          }

          $(".comment-container").html(renderCommentTree(response));
        } else {
          $(".comment-container").html(
            '<p class="text-muted">댓글이 없습니다.</p>'
          );
        }
      },
      error: function (xhr, status, error) {
        console.error("Error loading comments:", error);
        console.error("Status:", status);
        console.error("Response:", xhr.responseText);
        $(".comment-container").html(
          '<p class="text-danger">Error loading comments. Please check the console for details.</p>'
        );
      },
    });
  }

  $(document).on("click", ".reply_btn", function () {
    var thisClicked = $(this);
    var cmt_id = thisClicked.data("comment-id");
    var currentDepth = parseInt(thisClicked.data("depth"));

    // 현재 댓글 박스의 직접적인 reply_section만 선택 (자식 댓글의 reply_section 제외)
    var currentCommentBox = thisClicked.closest(".comment-box");
    var replySection = currentCommentBox.children(".reply_section");

    // 모든 답글창 닫기
    $(".reply_section").html("");

    // 현재 댓글에만 답글창 열기
    replySection.html(
      '<div class="reply-form p-3">\
                        <input type="text" class="reply_msg form-control mb-2" placeholder="답글을 입력하세요...">\
                        <div class="d-flex justify-content-end gap-2">\
                            <button class="btn btn-sm btn-success reply_add_btn" data-parent-id="' +
        cmt_id +
        '" data-depth="' +
        (currentDepth + 1) +
        '">답글 달기</button>\
                            <button class="btn btn-sm btn-outline-secondary reply_cancel_btn">취소</button>\
                        </div>\
                    </div>'
    );
  });

  $(document).on("click", ".reply_cancel_btn", function () {
    $(this).closest(".reply_section").html("");
  });

  $(document).on("click", ".reply_add_btn", function (e) {
    e.preventDefault();
    var thisClicked = $(this);
    var parent_id = thisClicked.data("parent-id");
    var depth = thisClicked.data("depth");
    var reply = thisClicked.closest(".reply_section").find(".reply_msg").val();

    if ($.trim(reply).length == 0) {
      alert("답글을 입력해주세요");
      return false;
    }

    var data = {
      parent_id: parent_id,
      msg: reply,
      add_comment: true,
    };
    $.ajax({
      type: "POST",
      url: "code.php",
      data: data,
      success: function (response) {
        alert(response);
        thisClicked.closest(".reply_section").html("");
        load_comment();
      },
      error: function (xhr, status, error) {
        alert("답글 추가 실패: " + error);
      },
    });
  });

  // 좋아요 버튼 클릭 이벤트
  $(document).on("click", ".like-btn", function () {
    var thisClicked = $(this);
    var commentId = thisClicked.data("comment-id");
    
    $.ajax({
      type: "POST",
      url: "code.php",
      data: {
        toggle_like: true,
        comment_id: commentId
      },
      dataType: "json",
      success: function (response) {
        if (response.error) {
          alert(response.error);
          return;
        }
        
        // 하트 아이콘과 카운트 업데이트
        var heartIcon = thisClicked.find('.heart-icon');
        var likeCount = thisClicked.find('.like-count');
        
        if (response.liked) {
          heartIcon.text('❤️');
          thisClicked.addClass('liked');
        } else {
          heartIcon.text('🤍');
          thisClicked.removeClass('liked');
        }
        
        likeCount.text(response.likes_count);
        
        // 버튼 애니메이션 효과
        thisClicked.addClass('like-animation');
        setTimeout(function() {
          thisClicked.removeClass('like-animation');
        }, 300);
      },
      error: function (xhr, status, error) {
        alert("좋아요 처리 실패: " + error);
      }
    });
  });

  // 댓글 숨기기/보이기 기능
  $(document).on("click", ".toggle_children_btn", function () {
    var thisClicked = $(this);
    var commentId = thisClicked.data("comment-id");
    var childrenContainer = $("#children-" + commentId);

    if (childrenContainer.is(":visible")) {
      childrenContainer.slideUp(500);
      thisClicked.text(
        "답글 보기 (" + childrenContainer.find(".comment-box").length + ")"
      );
    } else {
      childrenContainer.slideDown(500);
      thisClicked.text("답글 숨기기");
    }
  });

  $(".add_comment_btn").click(function (e) {
    e.preventDefault();

    var msg = $(".comment_textbox").val();
    if ($.trim(msg).length == 0) {
      error_msg = "please enter a comment";
      $("#error_status").text(error_msg);
      return false;
    } else {
      error_msg = "";
      $("#error_status").text(error_msg);
    }

    var data = {
      msg: msg,
      parent_id: 0, // 메인 댓글은 parent_id가 0
      add_comment: true,
    };

    $.ajax({
      type: "POST",
      url: "code.php",
      data: data,
      success: function (response) {
        alert(response);
        $(".comment_textbox").val("");
        load_comment(); // 댓글 추가 후 목록 새로고침
      },
      error: function (xhr, status, error) {
        alert("댓글 추가 실패: " + error);
      },
    });
  });
});
