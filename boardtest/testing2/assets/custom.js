$(document).ready(function () {
  load_comment();
  
  // 전역 변수
  let selectedFiles = [];

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
              var heartIconSrc = comment.user_liked == 1 ? 'img/thumbsUp.png' : 'img/thumbsUp.png';
              var heartIconClass = comment.user_liked == 1 ? 'heart-icon liked-heart' : 'heart-icon unliked-heart';
              html += '<div class="like-section mt-2 mb-2">\
                        <button class="like-btn ' + likedClass + '" data-comment-id="' + comment.id + '">\
                          <img src="' + heartIconSrc + '" class="' + heartIconClass + '" width="20" height="20" alt="like">\
                          <span class="like-count">' + (comment.likes_count || 0) + '</span>\
                        </button>\
                      </div>';
              
              // 미디어 파일 표시
              if (comment.media_files && comment.media_files.length > 0) {
                html += '<div class="comment-media-container">\
                          <div class="comment-media-grid">';
                
                $.each(comment.media_files, function(index, media) {
                  var mediaHtml = '';
                  var playIcon = '';
                  var typeBadge = media.file_type.toUpperCase();
                  
                  if (media.file_type === 'video') {
                    playIcon = '<div class="media-overlay"><i class="fas fa-play play-icon"></i></div>';
                    mediaHtml = '<video preload="metadata" muted>\
                                  <source src="' + media.file_path + '" type="' + media.mime_type + '">\
                                </video>';
                  } else {
                    mediaHtml = '<img src="' + (media.thumbnail_path || media.file_path) + '" alt="' + media.original_name + '">';
                  }
                  
                  html += '<div class="comment-media-item" data-media-path="' + media.file_path + '" data-media-type="' + media.file_type + '">\
                            ' + mediaHtml + '\
                            ' + playIcon + '\
                            <div class="media-type-badge">' + typeBadge + '</div>\
                          </div>';
                });
                
                html += '</div></div>';
              }
              
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
                        <textarea class="reply_msg form-control mb-2" rows="3" placeholder="답글을 입력하세요..."></textarea>\
                        <div class="reply-media-section mb-2">\
                            <label for="reply-media-' + cmt_id + '" class="btn btn-outline-secondary btn-sm">\
                                <i class="fas fa-paperclip"></i> 파일 첨부\
                            </label>\
                            <input type="file" id="reply-media-' + cmt_id + '" class="reply-media-input" multiple accept="image/*,video/*,.gif" style="display: none;">\
                            <div class="reply-media-preview mt-2"></div>\
                        </div>\
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

  // 답글 파일 선택 이벤트
  $(document).on('change', '.reply-media-input', function() {
    var files = this.files;
    var previewContainer = $(this).siblings('.reply-media-preview');
    previewContainer.empty();
    
    Array.from(files).forEach(function(file, index) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var mediaHtml = '';
        if (file.type.startsWith('image/')) {
          mediaHtml = '<img src="' + e.target.result + '" alt="preview">';
        } else if (file.type.startsWith('video/')) {
          mediaHtml = '<video src="' + e.target.result + '" muted></video>';
        }
        
        var previewItem = $('<div class="media-preview-item">' + 
                           mediaHtml + 
                           '<button type="button" class="remove-reply-media" data-index="' + index + '">×</button>' +
                           '</div>');
        previewContainer.append(previewItem);
      };
      reader.readAsDataURL(file);
    });
  });
  
  // 답글 미디어 파일 제거
  $(document).on('click', '.remove-reply-media', function() {
    $(this).closest('.media-preview-item').remove();
  });

  $(document).on("click", ".reply_add_btn", function (e) {
    e.preventDefault();
    var thisClicked = $(this);
    var parent_id = thisClicked.data("parent-id");
    var depth = thisClicked.data("depth");
    var reply = thisClicked.closest(".reply_section").find(".reply_msg").val();
    var replyMediaInput = thisClicked.closest(".reply_section").find(".reply-media-input")[0];
    var hasFiles = replyMediaInput && replyMediaInput.files.length > 0;

    if ($.trim(reply).length == 0 && !hasFiles) {
      alert("답글 내용이나 파일을 입력해주세요");
      return false;
    }

    var formData = new FormData();
    formData.append('parent_id', parent_id);
    formData.append('msg', reply);
    formData.append('add_comment', true);
    
    // 답글 파일들 추가
    if (hasFiles) {
      Array.from(replyMediaInput.files).forEach(function(file) {
        formData.append('media_files[]', file);
      });
    }

    $.ajax({
      type: "POST",
      url: "code.php",
      data: formData,
      processData: false,
      contentType: false,
      dataType: "json",
      success: function (response) {
        if (response.success) {
          alert(response.success);
          thisClicked.closest(".reply_section").html("");
          load_comment();
        } else if (response.error) {
          alert(response.error);
        }
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
          heartIcon.removeClass('unliked-heart').addClass('liked-heart');
          thisClicked.addClass('liked');
        } else {
          heartIcon.removeClass('liked-heart').addClass('unliked-heart');
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

  // 파일 선택 이벤트
  $("#media-files").change(function() {
    var files = this.files;
    selectedFiles = Array.from(files);
    updateMediaPreview();
  });
  
  // 미디어 미리보기 업데이트
  function updateMediaPreview() {
    var previewContainer = $("#media-preview");
    previewContainer.empty();
    
    selectedFiles.forEach(function(file, index) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var mediaHtml = '';
        if (file.type.startsWith('image/')) {
          mediaHtml = '<img src="' + e.target.result + '" alt="preview">';
        } else if (file.type.startsWith('video/')) {
          mediaHtml = '<video src="' + e.target.result + '" muted></video>';
        }
        
        var previewItem = $('<div class="media-preview-item">' + 
                           mediaHtml + 
                           '<button type="button" class="remove-media" data-index="' + index + '">×</button>' +
                           '</div>');
        previewContainer.append(previewItem);
      };
      reader.readAsDataURL(file);
    });
  }
  
  // 미디어 파일 제거
  $(document).on('click', '.remove-media', function() {
    var index = $(this).data('index');
    selectedFiles.splice(index, 1);
    updateMediaPreview();
  });
  
  // 미디어 모달 표시
  $(document).on('click', '.comment-media-item', function() {
    var mediaPath = $(this).data('media-path');
    var mediaType = $(this).data('media-type');
    
    var modalHtml = '<div class="media-modal" id="media-modal">' +
                    '<div class="media-modal-content">';
    
    if (mediaType === 'video') {
      modalHtml += '<video controls autoplay><source src="' + mediaPath + '"></video>';
    } else {
      modalHtml += '<img src="' + mediaPath + '" alt="media">';
    }
    
    modalHtml += '<button class="media-modal-close" onclick="closeMediaModal()">×</button>' +
                 '</div></div>';
    
    $('body').append(modalHtml);
    $('#media-modal').fadeIn(300);
  });
  
  // 미디어 모달 닫기
  window.closeMediaModal = function() {
    $('#media-modal').fadeOut(300, function() {
      $(this).remove();
    });
  };
  
  // 모달 배경 클릭 시 닫기
  $(document).on('click', '.media-modal', function(e) {
    if (e.target === this) {
      closeMediaModal();
    }
  });

  $(".add_comment_btn").click(function (e) {
    e.preventDefault();

    var msg = $(".comment_textbox").val();
    if ($.trim(msg).length == 0 && selectedFiles.length == 0) {
      error_msg = "댓글 내용이나 파일을 입력해주세요";
      $("#error_status").text(error_msg);
      return false;
    } else {
      error_msg = "";
      $("#error_status").text(error_msg);
    }

    var formData = new FormData();
    formData.append('msg', msg);
    formData.append('parent_id', 0);
    formData.append('add_comment', true);
    
    // 선택된 파일들 추가
    selectedFiles.forEach(function(file) {
      formData.append('media_files[]', file);
    });

    $.ajax({
      type: "POST",
      url: "code.php",
      data: formData,
      processData: false,
      contentType: false,
      dataType: "json",
      success: function (response) {
        if (response.success) {
          alert(response.success);
          $(".comment_textbox").val("");
          selectedFiles = [];
          $("#media-preview").empty();
          $("#media-files").val('');
          load_comment();
        } else if (response.error) {
          alert(response.error);
        }
      },
      error: function (xhr, status, error) {
        alert("댓글 추가 실패: " + error);
      },
    });
  });
});
