$(document).ready(function () {
  load_comment();
  
  // 전역 변수
  let selectedFiles = [];
  
  // 스레드 입력 영역 포커스 이벤트
  $(".thread-input").focus(function() {
    $(this).closest('.new-thread').addClass('focused');
  });
  
  $(".thread-input").blur(function() {
    if (!$(this).val().trim() && selectedFiles.length === 0) {
      $(this).closest('.new-thread').removeClass('focused');
    }
  });

  function load_comment() {
    $.ajax({
      type: "POST",
      url: "code.php",
      data: {
        comment_load_data: true,
      },
      dataType: "json",
      success: function (response) {
        console.log("댓글 데이터:", response);  // 디버깅용
        $(".comment-container").html("");

        if (response.error) {
          $(".comment-container").html(
            '<p class="text-danger">Error: ' + response.error + "</p>"
          );
          return;
        }

        if (response.length > 0) {
          // 최신 글이 맨 위에 오도록 순서 뒤집기
          response.reverse();
          
          function renderCommentTree(comments, depth = 0) {
            var html = "";
            $.each(comments, function (key, comment) {
              if (depth === 0) {
                // 메인 포스트 카드로 렌더링
                html += renderPostCard(comment);
              } else {
                // 댓글로 렌더링
                html += renderComment(comment, depth);
              }
            });
            return html;
          }
          
          function renderPostCard(post) {
            var likedClass = post.user_liked == 1 ? 'liked' : '';
            var likesCount = post.likes_count || 0;
            
            var html = '<div class="thread-card" data-comment-id="' + post.id + '">';
            
            // 스레드 헤더
            html += '<div class="thread-header">\
                      <img src="https://via.placeholder.com/40" alt="프로필" class="user-avatar">\
                      <div class="thread-user-info">\
                        <span class="thread-username">' + (post.fullname || "Unknown User") + '</span>\
                        <span class="thread-time">' + post.created_at + '</span>\
                      </div>\
                      <button class="thread-menu">\
                        <i class="fas fa-ellipsis-h"></i>\
                      </button>\
                    </div>';
            
            // 스레드 컨텐츠
            html += '<div class="thread-content">';
            
            // 텍스트 내용
            if (post.msg && post.msg.trim()) {
              html += '<div class="thread-text">' + post.msg + '</div>';
            }
            
            // 미디어 컨텐츠 (모든 미디어 파일 표시)
            if (post.media_files && post.media_files.length > 0) {
              html += '<div class="thread-media">';
              
              // 미디어 파일이 여러 개인 경우 그리드로 표시
              if (post.media_files.length > 1) {
                html += '<div class="media-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">';
              }
              
              $.each(post.media_files, function(index, media) {
                console.log("미디어 파일 전체 정보:", media); // 디버깅용
                
                if (media.file_type === 'video') {
                  html += '<video controls class="comment-media-item" data-media-path="' + media.file_path + '" data-media-type="video" style="width: 100%; border-radius: 8px;">\
                            <source src="' + media.file_path + '" type="' + media.mime_type + '">\
                          </video>';
                } else {
                  // 이미지의 경우 항상 원본 이미지 사용 (썸네일 문제 해결될 때까지)
                  var imageSrc = media.file_path;
                  console.log("원본 경로:", media.file_path);
                  console.log("썸네일 경로:", media.thumbnail_path);
                  console.log("최종 사용 경로:", imageSrc);
                  
                  html += '<img src="' + imageSrc + '" alt="' + (media.original_name || '스레드 이미지') + '" class="comment-media-item" data-media-path="' + media.file_path + '" data-media-type="image" style="width: 100%; border-radius: 8px; cursor: pointer;" onerror="console.log(\'이미지 로드 실패:\', this.src);">';
                }
              });
              
              if (post.media_files.length > 1) {
                html += '</div>';
              }
              
              html += '</div>';
            }
            
            html += '</div>';
            
            // 스레드 액션
            html += '<div class="thread-actions">\
                      <button class="action-button like-btn ' + likedClass + '" data-comment-id="' + post.id + '">\
                        <i class="' + (post.user_liked == 1 ? 'fas' : 'far') + ' fa-heart"></i>\
                      </button>\
                      <button class="action-button reply_btn" data-comment-id="' + post.id + '" data-depth="0">\
                        <i class="far fa-comment"></i>\
                      </button>\
                      <button class="action-button">\
                        <i class="fas fa-retweet"></i>\
                      </button>\
                      <button class="action-button">\
                        <i class="far fa-paper-plane"></i>\
                      </button>\
                    </div>';
            
            // 스레드 통계
            if (likesCount > 0 || (post.children && post.children.length > 0)) {
              html += '<div class="thread-stats">';
              var stats = [];
              if (likesCount > 0) {
                stats.push(likesCount + '개의 좋아요');
              }
              if (post.children && post.children.length > 0) {
                stats.push(post.children.length + '개의 답글');
              }
              html += stats.join(' · ');
              html += '</div>';
            }
            
            // 답글 링크 (답글이 있을 때만 표시)
            if (post.children && post.children.length > 0) {
              html += '<div class="reply-link show_replies_btn" data-comment-id="' + post.id + '">\
                        <i class="far fa-comment"></i> 답글 ' + post.children.length + '개 보기\
                      </div>';
            }
            
            // 답글 섹션
            html += '<div class="reply_section"></div>';
            
            // 답글들 (모달에서 사용하기 위해 숨겨진 상태로 보관)
            if (post.children && post.children.length > 0) {
              html += '<div class="thread-replies children-container" id="children-' + post.id + '" style="display: none;">';
              $.each(post.children, function(index, child) {
                html += renderReply(child, 1);
              });
              html += '</div>';
            }
            
            html += '</div>';
            return html;
          }
          
          function renderReply(reply, depth) {
            var likedClass = reply.user_liked == 1 ? 'liked' : '';
            var likesCount = reply.likes_count || 0;
            
            var html = '<div class="reply-item" data-comment-id="' + reply.id + '" data-depth="' + depth + '">';
            
            // 답글 헤더
            html += '<div class="reply-header">\
                      <img src="https://via.placeholder.com/32" alt="프로필" class="reply-avatar">\
                      <span class="reply-username">' + (reply.fullname || "Unknown User") + '</span>\
                      <span class="reply-time">' + reply.created_at + '</span>\
                    </div>';
            
            // 답글 내용
            html += '<div class="reply-content">' + reply.msg + '</div>';
            
            // 미디어 파일 표시
            if (reply.media_files && reply.media_files.length > 0) {
              $.each(reply.media_files, function(index, media) {
                if (media.file_type === 'video') {
                  html += '<video controls style="max-width: 200px; border-radius: 8px; margin: 8px 0 8px 40px; display: block;" class="comment-media-item" data-media-path="' + media.file_path + '" data-media-type="video">\
                            <source src="' + media.file_path + '" type="' + media.mime_type + '">\
                          </video>';
                } else {
                  var imageSrc = media.thumbnail_path || media.file_path;
                  html += '<img src="' + imageSrc + '" alt="' + media.original_name + '" style="max-width: 200px; border-radius: 8px; margin: 8px 0 8px 40px; cursor: pointer; display: block;" class="comment-media-item" data-media-path="' + media.file_path + '" data-media-type="image">';
                }
              });
            }
            
            // 답글 액션
            html += '<div class="reply-actions">\
                      <button class="reply-action-btn like-btn ' + likedClass + '" data-comment-id="' + reply.id + '">\
                        <i class="' + (reply.user_liked == 1 ? 'fas' : 'far') + ' fa-heart"></i>\
                        <span>' + (likesCount > 0 ? likesCount : '') + '</span>\
                      </button>\
                      <button class="reply-action-btn reply_btn" data-comment-id="' + reply.id + '" data-depth="' + depth + '">\
                        <i class="far fa-comment"></i>\
                      </button>\
                    </div>';
            
            // 답글 섹션
            html += '<div class="reply_section"></div>';
            
            // 하위 답글들 (모달에서는 바로 표시)
            if (reply.children && reply.children.length > 0) {
              html += '<div class="children-container" id="children-' + reply.id + '" style="margin-left: 20px; margin-top: 12px; padding-left: 16px; border-left: 2px solid var(--border-color);">';
              $.each(reply.children, function(index, child) {
                html += renderReply(child, depth + 1);
              });
              html += '</div>';
            }
            
            html += '</div>';
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
    
    // 모달 내부인지 확인
    var isInModal = thisClicked.closest(".reply-compose-modal").length > 0;
    var reply, replyMediaInput;
    
    if (isInModal) {
      // 모달에서 답글 작성
      reply = thisClicked.closest(".reply-compose-modal").find(".reply_msg").val();
      replyMediaInput = thisClicked.closest(".reply-compose-modal").find(".reply-media-input")[0];
    } else {
      // 일반 페이지에서 답글 작성
      reply = thisClicked.closest(".reply_section").find(".reply_msg").val();
      replyMediaInput = thisClicked.closest(".reply_section").find(".reply-media-input")[0];
    }
    
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
          
          if (isInModal) {
            // 모달 닫기
            closeReplyComposeModal();
          } else {
            // 답글 폼 닫기
            thisClicked.closest(".reply_section").html("");
          }
          
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

  // 답글 보기 모달 열기
  $(document).on("click", ".show_replies_btn", function () {
    var thisClicked = $(this);
    var commentId = thisClicked.data("comment-id");
    var childrenContainer = $("#children-" + commentId);
    var threadCard = thisClicked.closest('.thread-card');
    
    // 원본 스레드 정보 가져오기
    var originalContent = threadCard.clone();
    originalContent.find('.reply-link').remove();
    originalContent.find('.reply_section').remove();
    originalContent.find('.children-container').remove();
    originalContent.find('.thread-replies').remove();
    
    // 답글들 가져오기
    var repliesContent = childrenContainer.html();
    
    // 모달 생성
    var modalHtml = '<div class="reply-modal" id="reply-modal-' + commentId + '">' +
                    '<div class="reply-modal-content">' +
                    '<div class="reply-modal-header">' +
                    '<div class="reply-modal-title">답글</div>' +
                    '<button class="reply-modal-close" onclick="closeReplyModal(\'' + commentId + '\')">&times;</button>' +
                    '</div>' +
                    '<div class="reply-modal-body">' +
                    '<div class="original-thread">' + originalContent.prop('outerHTML') + '</div>' +
                    '<div class="replies-list">' + repliesContent + '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
    
    // 모달을 body에 추가하고 표시
    $('body').append(modalHtml);
    $('#reply-modal-' + commentId).fadeIn(300);
  });
  
  // 답글 모달 닫기 함수
  window.closeReplyModal = function(commentId) {
    $('#reply-modal-' + commentId).fadeOut(300, function() {
      $(this).remove();
    });
  };
  
  // 모달 배경 클릭시 닫기
  $(document).on('click', '.reply-modal', function(e) {
    if (e.target === this) {
      var modalId = $(this).attr('id');
      var commentId = modalId.replace('reply-modal-', '');
      closeReplyModal(commentId);
    }
  });

  // 답글 달기 버튼 클릭 시 전체 화면 모달 열기
  $(document).on("click", ".reply_btn", function () {
    var thisClicked = $(this);
    var commentId = thisClicked.data("comment-id");
    var currentDepth = parseInt(thisClicked.data("depth")) || 0;

    // 원본 포스트 정보 가져오기
    var threadCard = thisClicked.closest('.thread-card, .reply-item');
    var originalPost = threadCard.clone();
    
    // 불필요한 요소들 제거
    originalPost.find('.thread-actions').remove();
    originalPost.find('.thread-stats').remove();
    originalPost.find('.reply-link').remove();
    originalPost.find('.reply_section').remove();
    originalPost.find('.children-container').remove();
    originalPost.find('.thread-replies').remove();
    
    // 답글 작성 모달 생성
    var modalHtml = '<div class="reply-compose-modal" id="reply-compose-modal">' +
                    '<div class="reply-compose-header">' +
                    '<div class="reply-compose-title">답글</div>' +
                    '<button class="reply-compose-close" onclick="closeReplyComposeModal()">&times;</button>' +
                    '</div>' +
                    '<div class="reply-compose-body">' +
                    '<div class="original-post-preview">' + originalPost.prop('outerHTML') + '</div>' +
                    '<div class="reply-compose-form">' +
                    '<div class="reply-compose-input-area">' +
                    '<img src="https://via.placeholder.com/40" alt="프로필" class="user-avatar">' +
                    '<textarea class="reply-compose-textarea reply_msg" placeholder="답글을 입력하세요..."></textarea>' +
                    '</div>' +
                    '<div class="reply-compose-actions">' +
                    '<div>' +
                    '<label for="reply-compose-media" class="reply-compose-media-btn">' +
                    '<i class="fas fa-image"></i>' +
                    '</label>' +
                    '<input type="file" id="reply-compose-media" class="reply-media-input" multiple accept="image/*,video/*,.gif" style="display: none;">' +
                    '</div>' +
                    '<button class="reply-compose-submit reply_add_btn" data-parent-id="' + commentId + '" data-depth="' + (currentDepth + 1) + '">게시</button>' +
                    '</div>' +
                    '<div class="reply-compose-privacy">누구에게나 답글 및 인용 허용</div>' +
                    '<div class="reply-media-preview"></div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';

    // 모달을 body에 추가하고 표시
    $('body').append(modalHtml);
    $('#reply-compose-modal').fadeIn(300);
    
    // 텍스트 영역에 포커스
    setTimeout(function() {
      $('.reply-compose-textarea').focus();
    }, 300);
  });
  
  // 답글 작성 모달 닫기 함수
  window.closeReplyComposeModal = function() {
    $('#reply-compose-modal').fadeOut(300, function() {
      $(this).remove();
    });
  };
  
  // 모달 배경 클릭시 닫기 (답글 작성 모달)
  $(document).on('click', '.reply-compose-modal', function(e) {
    if (e.target === this) {
      closeReplyComposeModal();
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
          // 성공 메시지 표시 (alert 대신 더 부드러운 알림)
          $("#error_status").html('<div style="color: #4CAF50; padding: 8px; background: rgba(76, 175, 80, 0.1); border-radius: 4px; margin-bottom: 12px;">게시물이 성공적으로 작성되었습니다!</div>');
          
          // 입력 필드 초기화
          $(".comment_textbox").val("");
          selectedFiles = [];
          $("#media-preview").empty();
          $("#media-files").val('');
          
          // 댓글 목록 새로고침
          load_comment();
          
          // 성공 메시지를 3초 후 제거
          setTimeout(function() {
            $("#error_status").html("");
          }, 3000);
        } else if (response.error) {
          $("#error_status").html('<div style="color: #f44336; padding: 8px; background: rgba(244, 67, 54, 0.1); border-radius: 4px; margin-bottom: 12px;">' + response.error + '</div>');
        }
      },
      error: function (xhr, status, error) {
        alert("댓글 추가 실패: " + error);
      },
    });
  });
});
