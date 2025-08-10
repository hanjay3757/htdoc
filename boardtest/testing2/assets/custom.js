$(document).ready(function () {
  load_comment();
  loadCurrentUserProfile();
  
  // 전역 변수
  let selectedFiles = [];
  let currentUserProfile = {
    fullname: '',
    profile_image: 'assets/default-avatar-40.png'
  };

  // 스레드 입력 영역 포커스 이벤트
  $(".thread-input").focus(function() {
    $(this).closest('.new-thread').addClass('focused');
  });
  
  $(".thread-input").blur(function() {
    if (!$(this).val().trim() && selectedFiles.length === 0) {
      $(this).closest('.new-thread').removeClass('focused');
    }
  });

  // 텍스트 영역 자동 크기 조절
  $(".thread-input").on('input', function() {
    this.style.height = '24px';
    this.style.height = (this.scrollHeight) + 'px';
  });

  // 게시물 작성 모달 열기 (트리거 영역)
  $("#open-post-modal").click(function() {
    openNewThreadModal();
  });

  // 게시물 작성 모달 열기 (트리거 게시 버튼)
  $("#trigger-post-btn").click(function() {
    openNewThreadModal();
  });

  // 피드 드롭다운 토글
  $("#feed-dropdown").click(function(e) {
    e.stopPropagation();
    var $dropdown = $("#feed-dropdown-menu");
    var $btn = $(this);
    
    if ($dropdown.hasClass('show')) {
      $dropdown.removeClass('show');
      $btn.removeClass('open');
    } else {
      $dropdown.addClass('show');
      $btn.addClass('open');
    }
  });

  // 피드 옵션 선택
  $(".feed-option").click(function() {
    var feedType = $(this).data('feed');
    var feedText = $(this).text();
    
    // 드롭다운 닫기
    $("#feed-dropdown-menu").removeClass('show');
    $("#feed-dropdown").removeClass('open');
    
    // 현재 선택된 피드 텍스트 업데이트
    $(".current-feed").text(feedText);
    
    // 활성 상태 업데이트
    $(".feed-option").removeClass('active');
    $(this).addClass('active');
    
    // 피드 로드
    if (feedType === 'recommend') {
      console.log('추천 피드 선택됨');
      loadRecommendedFeed();
    } else if (feedType === 'following') {
      console.log('팔로잉 피드 선택됨');
      loadFollowingFeed();
    }
  });

  // 드롭다운 외부 클릭시 닫기
  $(document).click(function() {
    $("#feed-dropdown-menu").removeClass('show');
    $("#feed-dropdown").removeClass('open');
  });

  // 추천 피드 로드 (모든 게시물)
  function loadRecommendedFeed() {
    // 기존 load_comment 함수 호출 (모든 댓글 로드)
    load_comment();
  }

  // 팔로잉 피드 로드 (팔로우한 사용자 게시물만)
  function loadFollowingFeed() {
    $.ajax({
      type: "POST",
      url: "code.php",
      data: {
        comment_load_data: true,
        filter_type: 'following' // 팔로잉 필터 추가
      },
      dataType: "json",
      success: function (response) {
        console.log("팔로잉 데이터:", response);
        $(".comment-container").html("");

        if (response.error) {
          $(".comment-container").html(
            '<p class="text-danger">Error: ' + response.error + "</p>"
          );
          return;
        }

        if (response.length > 0) {
          // 기존과 동일한 렌더링 로직 사용
          response.reverse();
          $(".comment-container").html(renderCommentTree(response));
        } else {
          $(".comment-container").html(
            '<div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">' +
            '<i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>' +
            '<p style="font-size: 16px; margin-bottom: 8px;">팔로우한 사용자가 없습니다</p>' +
            '<p style="font-size: 14px;">다른 사용자를 팔로우하여 피드를 채워보세요!</p>' +
            '</div>'
          );
        }
      },
      error: function (xhr, status, error) {
        console.error("Error loading following feed:", error);
        $(".comment-container").html(
          '<p class="text-danger">팔로잉 피드 로드 실패. 콘솔을 확인해주세요.</p>'
        );
      }
    });
  }

  // renderCommentTree 함수를 전역으로 이동 (다른 함수에서도 사용할 수 있도록)
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

  // renderPostCard 함수를 전역으로 이동
  function renderPostCard(post) {
    var likedClass = post.user_liked == 1 ? 'liked' : '';
    var likesCount = post.likes_count || 0;
    
    // 프로필 이미지 결정
    var profileImage = post.profile_image || 'assets/default-avatar-40.png';
    
    var html = '<div class="thread-card" data-comment-id="' + post.id + '">';
    
    // 스레드 헤더
    html += '<div class="thread-header">\
              <img src="' + profileImage + '" alt="프로필" class="user-avatar">\
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
      var gridClass = 'media-grid';
      if (post.media_files.length === 1) {
        gridClass += ' single-item';
      } else if (post.media_files.length === 2) {
        gridClass += ' two-items';
      } else {
        gridClass += ' multiple-items';
      }
      html += '<div class="' + gridClass + '">';
      
      $.each(post.media_files, function(index, media) {
        console.log("미디어 파일 전체 정보:", media); // 디버깅용
        
        if (media.file_type === 'video') {
          html += '<video controls class="comment-media-item" data-media-path="' + media.file_path + '" data-media-type="video">\
                    <source src="' + media.file_path + '" type="' + media.mime_type + '">\
                  </video>';
        } else {
          // 이미지의 경우 항상 원본 이미지 사용 (썸네일 문제 해결될 때까지)
          var imageSrc = media.file_path;
          console.log("원본 경로:", media.file_path);
          console.log("썸네일 경로:", media.thumbnail_path);
          console.log("최종 사용 경로:", imageSrc);
          
          html += '<img src="' + imageSrc + '" alt="' + (media.original_name || '스레드 이미지') + '" class="comment-media-item" data-media-path="' + media.file_path + '" data-media-type="image" onerror="console.log(\'이미지 로드 실패:\', this.src);">';
        }
      });
      
      html += '</div>'; // media-grid 닫기
      
      html += '</div>';
    }
    
    html += '</div>';
    
    // 스레드 액션 (버튼에 숫자 포함)
    html += '<div class="thread-actions">\
              <button class="action-button like-btn ' + likedClass + '" data-comment-id="' + post.id + '">\
                <i class="' + (post.user_liked == 1 ? 'fas' : 'far') + ' fa-heart"></i>\
                <span class="action-count">' + (likesCount > 0 ? likesCount : '') + '</span>\
              </button>\
              <button class="action-button reply_btn" data-comment-id="' + post.id + '" data-depth="0">\
                <i class="far fa-comment"></i>\
                <span class="action-count">' + (post.children && post.children.length > 0 ? post.children.length : '') + '</span>\
              </button>\
              <button class="action-button">\
                <i class="fas fa-retweet"></i>\
                <span class="action-count"></span>\
              </button>\
              <button class="action-button">\
                <i class="far fa-paper-plane"></i>\
                <span class="action-count"></span>\
              </button>\
            </div>';
    
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

  // renderReply 함수를 전역으로 이동
  function renderReply(reply, depth) {
    var likedClass = reply.user_liked == 1 ? 'liked' : '';
    var likesCount = reply.likes_count || 0;
    
    // 프로필 이미지 결정 (작은 사이즈)
    var profileImage = reply.profile_image || 'assets/default-avatar-32.png';
    
    var html = '<div class="reply-item" data-comment-id="' + reply.id + '" data-depth="' + depth + '">';
    
    // 답글 헤더
    html += '<div class="reply-header">\
              <img src="' + profileImage + '" alt="프로필" class="reply-avatar">\
              <span class="reply-username">' + (reply.fullname || "Unknown User") + '</span>\
              <span class="reply-time">' + reply.created_at + '</span>\
            </div>';
    
    // 답글 내용
    html += '<div class="reply-content">' + reply.msg + '</div>';
    
    // 미디어 파일 표시
    if (reply.media_files && reply.media_files.length > 0) {
      $.each(reply.media_files, function(index, media) {
          if (media.file_type === 'video') {
          html += '<video controls class="comment-media-item" data-media-path="' + media.file_path + '" data-media-type="video">\
                          <source src="' + media.file_path + '" type="' + media.mime_type + '">\
                        </video>';
          } else {
            var imageSrc = media.thumbnail_path || media.file_path;
          html += '<img src="' + imageSrc + '" alt="' + media.original_name + '" class="comment-media-item" data-media-path="' + media.file_path + '" data-media-type="image">';
        }
      });
    }
    
    // 답글 액션 (좋아요 버튼 제거)
    html += '<div class="reply-actions">\
            </div>';
    
    // 간단한 텍스트 입력창 + 하단 아이콘 바
    html += '<div class="simple-reply-input">\
              <input type="text" class="reply_msg simple-input" placeholder="답글을 입력하세요..." data-parent-id="' + reply.id + '" data-depth="' + (depth + 1) + '" />\
              <div class="reply-actions-bar">\
                <label class="reply-action-icon" for="simple-media-' + reply.id + '">\
                  <i class="fas fa-image"></i>\
                </label>\
                <div class="reply-action-icon">\
                  <i class="far fa-smile"></i>\
                </div>\
                <div class="reply-action-icon">\
                  <i class="fas fa-map-marker-alt"></i>\
                </div>\
                <div class="reply-action-icon">\
                  <i class="fas fa-music"></i>\
                </div>\
                <input type="file" id="simple-media-' + reply.id + '" class="simple-media-input" accept="image/*,video/*,.gif" style="display: none;" multiple />\
              </div>\
              <div class="simple-media-preview" id="simple-preview-' + reply.id + '"></div>\
                  </div>';
    
    // 답글 섹션
    html += '<div class="reply_section"></div>';
    
    // 하위 답글들이 있으면 컨테이너만 생성 (토글 버튼은 모달에서만 표시)
    if (reply.children && reply.children.length > 0) {
      console.log("답글 ID " + reply.id + "에 " + reply.children.length + "개의 하위 답글이 있음:", reply.children);
      
      html += '<div class="children-container" id="nested-children-' + reply.id + '" style="margin-left: 20px; margin-top: 12px; padding-left: 16px; border-left: 2px solid var(--border-color); display: none;">';
      $.each(reply.children, function(index, child) {
        console.log("하위 답글 렌더링:", child);
        html += renderReply(child, depth + 1);
      });
      html += '</div>';
    } else {
      console.log("답글 ID " + reply.id + "에는 하위 답글이 없음");
    }
    
    html += '</div>';
    return html;
  }

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
        
        // 하트 아이콘 업데이트
        var heartIcon = thisClicked.find('i');
        var actionCount = thisClicked.find('.action-count');
        
        if (response.liked) {
          heartIcon.removeClass('far').addClass('fas');
          thisClicked.addClass('liked');
        } else {
          heartIcon.removeClass('fas').addClass('far');
          thisClicked.removeClass('liked');
        }
        
        // 숫자 업데이트
        actionCount.text(response.likes_count > 0 ? response.likes_count : '');
        
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
    originalContent.find('.show_replies_btn').remove();
    originalContent.find('.thread-actions').remove(); // 액션 버튼들 제거
    
    // 원본 포스트가 확실히 보이도록 스타일 추가
    originalContent.css('display', 'block');
    
    // 답글들 가져오기
    var repliesContent = childrenContainer.html();
    
    // 모달 생성
    var modalHtml = '<div class="reply-modal" id="reply-modal-' + commentId + '">' +
                    '<div class="reply-modal-content">' +
                    '<div class="reply-modal-header">' +
                    '<button class="reply-modal-cancel" onclick="closeReplyModal(\'' + commentId + '\')">취소</button>' +
                    '<div class="reply-modal-title">답글</div>' +
                    '<button class="reply-modal-more">⋯</button>' +
                    '</div>' +
                    '<div class="reply-modal-body">' +
                    '<div class="original-thread">' + originalContent.prop('outerHTML') + '</div>' +
                    '<div class="replies-list">' + repliesContent + '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
    
    // 모달을 body에 추가하고 표시
    $('body').append(modalHtml);
    $('body').css('overflow', 'hidden'); // 배경 스크롤 막기
    
    // 다른 모든 요소들의 z-index를 강제로 낮춤
    $('*').not('.reply-modal, .reply-modal *').each(function() {
      var currentZIndex = $(this).css('z-index');
      if (currentZIndex !== 'auto' && parseInt(currentZIndex) > 1000) {
        $(this).data('original-z-index-reply', currentZIndex);
        $(this).css('z-index', '999');
      }
    });
    
    $('#reply-modal-' + commentId).css({
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center'
    }).hide().fadeIn(300);
    
    // 모달 내에서 토글 버튼 추가
    $('#reply-modal-' + commentId + ' .children-container').each(function() {
      var container = $(this);
      var containerId = container.attr('id');
      var replyId = containerId.replace('nested-children-', '');
      var replyCount = container.find('.reply-item').length;
      
      if (replyCount > 0) {
        // 토글 버튼을 컨테이너 바로 앞에 추가
        var toggleBtn = '<div class="toggle-replies-btn" data-reply-id="' + replyId + '" style="margin: 8px 0; color: var(--text-secondary); font-size: 12px; cursor: pointer;">── 답글 ' + replyCount + '개 보기</div>';
        container.before(toggleBtn);
      }
    });
    
    // 모달 내용을 상단으로 스크롤
    setTimeout(function() {
      $('#reply-modal-' + commentId + ' .reply-modal-content').scrollTop(0);
    }, 100);
  });
  
  // 답글 모달 닫기 함수
  window.closeReplyModal = function(commentId) {
    $('#reply-modal-' + commentId).fadeOut(300, function() {
      $(this).remove();
      $('body').css('overflow', 'auto'); // 배경 스크롤 복원
      
      // 원래 z-index 복원
      $('*').each(function() {
        var originalZIndex = $(this).data('original-z-index-reply');
        if (originalZIndex) {
          $(this).css('z-index', originalZIndex);
          $(this).removeData('original-z-index-reply');
        }
      });
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

  // 답글 달기 버튼 클릭 시 처리 (메인 포스트에만)
  $(document).on("click", ".reply_btn", function () {
    var thisClicked = $(this);
    var commentId = thisClicked.data("comment-id");
    var currentDepth = parseInt(thisClicked.data("depth")) || 0;

    // 메인 포스트에서만 모달 열기
    if (thisClicked.closest('.thread-card').length > 0 && thisClicked.closest('.reply-item').length === 0) {
      openReplyComposeModal(thisClicked, commentId, currentDepth);
    }
    // 답글에서는 아무 동작 안함 (이미 인라인 입력창이 있음)
  });
  
  // 간단한 답글 미디어 파일 선택
  $(document).on('change', '.simple-media-input', function() {
    var files = this.files;
    var replyId = $(this).attr('id').replace('simple-media-', '');
    var previewContainer = $('#simple-preview-' + replyId);
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
        
        if (mediaHtml) {
          previewContainer.append('<div class="simple-media-item">' + mediaHtml + '</div>');
        }
      };
      reader.readAsDataURL(file);
    });
  });

  // 간단한 답글 입력창에서 엔터키 처리
  $(document).on("keypress", ".simple-input", function(e) {
    if (e.which === 13) { // 엔터키
      var thisInput = $(this);
      var reply = thisInput.val().trim();
      var parentId = thisInput.data("parent-id");
      var depth = thisInput.data("depth");
      
      // 미디어 파일 가져오기
      var replyContainer = thisInput.closest('.simple-reply-input');
      var mediaInput = replyContainer.find('.simple-media-input')[0];
      var hasFiles = mediaInput && mediaInput.files.length > 0;
      
      if (reply === "" && !hasFiles) {
        alert("답글 내용이나 파일을 입력해주세요.");
        return;
      }
      
      var formData = new FormData();
      formData.append('parent_id', parentId);
      formData.append('msg', reply);
      formData.append('add_comment', true);
      
      // 미디어 파일들 추가
      if (hasFiles) {
        Array.from(mediaInput.files).forEach(function(file) {
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
            thisInput.val(""); // 입력창 비우기
            replyContainer.find('.simple-media-preview').empty(); // 미리보기 비우기
            if (mediaInput) mediaInput.value = ''; // 파일 입력 비우기
            
            // 모달 안에서 답글 작성한 경우 모달 내용 업데이트
            if (thisInput.closest('.reply-modal').length > 0) {
              var modalId = thisInput.closest('.reply-modal').attr('id');
              var commentId = modalId.replace('reply-modal-', '');
              
              // 모달 닫고 다시 열기로 새로운 데이터 로드
              closeReplyModal(commentId);
              setTimeout(function() {
                $('.show_replies_btn[data-comment-id="' + commentId + '"]').click();
              }, 100);
            } else {
              load_comment(); // 일반 페이지에서는 전체 새로고침
            }
          } else if (response.error) {
            alert(response.error);
          }
        },
        error: function (xhr, status, error) {
          console.error("답글 추가 실패:", error);
          alert("답글 추가에 실패했습니다. 다시 시도해주세요.");
        }
      });
    }
  });
  
  // 답글 숨기기/보이기 토글 (모달에서만 생성됨)
  $(document).on("click", ".toggle-replies-btn", function() {
    var thisBtn = $(this);
    var replyId = thisBtn.data("reply-id");
    var childrenContainer = thisBtn.next('.children-container'); // 바로 다음 형제 요소

    if (childrenContainer.is(":visible")) {
      // 숨기기
      childrenContainer.css('display', 'none');
      thisBtn.html('── 답글 ' + childrenContainer.find('.reply-item').length + '개 보기');
    } else {
      // 보이기 - 인라인 스타일로 강제 적용
      childrenContainer.attr('style', 'margin-left: 20px; margin-top: 12px; padding-left: 16px; border-left: 2px solid var(--border-color); display: block !important; visibility: visible !important; opacity: 1 !important;');
      
      // 숨겨진 조상 요소들도 모두 보이게 만들기
      var hiddenParents = childrenContainer.parents().filter(function() {
        return $(this).css('display') === 'none' || $(this).css('visibility') === 'hidden';
      });
      
      if (hiddenParents.length > 0) {
        hiddenParents.each(function() {
          $(this).css({
            'display': 'block',
            'visibility': 'visible'
          });
        });
      }
      
      thisBtn.html('── 답글 숨기기');
    }
  });
  
  // 게시물 작성 모달 열기 함수
  function openNewThreadModal() {
    var modalHtml = '<div class="new-thread-modal" id="new-thread-modal">' +
                    '<div class="new-thread-container">' +
                    '<div class="new-thread-header">' +
                    '<button class="new-thread-cancel" onclick="closeNewThreadModal()">취소</button>' +
                    '<div class="new-thread-title">새 스레드</div>' +
                    '<button class="post-btn add_comment_btn">게시</button>' +
                    '</div>' +
                    '<div class="new-thread-body">' +
                    '<div class="new-thread">' +
                    '<div class="thread-input-area">' +
                    '<img src="' + (currentUserProfile.profile_image || 'assets/default-avatar-40.png') + '" alt="프로필" class="user-avatar">' +
                    '<div class="input-wrapper">' +
                    '<textarea class="comment_textbox thread-input" placeholder="무슨 일이 일어나고 있나요?"></textarea>' +
                    '<div class="input-actions">' +
                    '<label for="modal-media-files" class="attach-btn">' +
                    '<i class="fas fa-image"></i>' +
                    '</label>' +
                    '<input type="file" id="modal-media-files" multiple accept="image/*,video/*,.gif" style="display: none;">' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div id="modal-media-preview" class="media-preview"></div>' +
                    '<div id="modal-error-status" class="error-msg"></div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';

    // 모달을 body에 추가하고 표시
    $('body').append(modalHtml);
    $('body').css('overflow', 'hidden'); // 배경 스크롤 막기
    
    // 다른 모든 요소들의 z-index를 강제로 낮춤
    $('*').not('.new-thread-modal, .new-thread-modal *').each(function() {
      var currentZIndex = $(this).css('z-index');
      if (currentZIndex !== 'auto' && parseInt(currentZIndex) > 1000) {
        $(this).data('original-z-index-thread', currentZIndex);
        $(this).css('z-index', '999');
      }
    });
    
    $('#new-thread-modal').css({
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center'
    }).hide().fadeIn(300);
    
    // 텍스트 영역에 포커스
    setTimeout(function() {
      $('.new-thread-modal .thread-input').focus();
    }, 300);

    // 모달 내 파일 선택 이벤트
    $("#modal-media-files").off('change').on('change', function() {
      var files = this.files;
      selectedFiles = Array.from(files);
      updateModalMediaPreview();
    });
  }

  // 게시물 작성 모달 닫기 함수
  window.closeNewThreadModal = function() {
    $('#new-thread-modal').fadeOut(300, function() {
      $(this).remove();
      $('body').css('overflow', 'auto'); // 배경 스크롤 복원
      
      // 원래 z-index 복원
      $('*').each(function() {
        var originalZIndex = $(this).data('original-z-index-thread');
        if (originalZIndex) {
          $(this).css('z-index', originalZIndex);
          $(this).removeData('original-z-index-thread');
        }
      });
      
      // 선택된 파일들 초기화
      selectedFiles = [];
    });
  };

  // 모달 배경 클릭시 닫기
  $(document).on('click', '.new-thread-modal', function(e) {
    if (e.target === this) {
      closeNewThreadModal();
    }
  });

  // 모달 미디어 미리보기 업데이트
  function updateModalMediaPreview() {
    var previewContainer = $("#modal-media-preview");
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

  // 답글 작성 모달 열기 함수
  function openReplyComposeModal(thisClicked, commentId, currentDepth) {
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
                    '<div class="reply-compose-container">' +
                    '<div class="reply-compose-header">' +
                    '<button class="reply-compose-cancel" onclick="closeReplyComposeModal()">취소</button>' +
                    '<div class="reply-compose-title">답글</div>' +
                    '<button class="reply-compose-more">⋯</button>' +
                    '</div>' +
                    '<div class="reply-compose-body">' +
                    '<div class="original-post-preview">' + originalPost.prop('outerHTML') + '</div>' +
                    '<div class="reply-compose-form">' +
                    '<div class="reply-compose-input-area">' +
                    '<img src="' + (currentUserProfile.profile_image || 'assets/default-avatar-32.png') + '" alt="프로필" class="user-avatar">' +
                    '<textarea class="reply-compose-textarea reply_msg" placeholder="답글을 입력하세요..."></textarea>' +
                    '</div>' +
                    '</div>' +
                    '<div class="reply-compose-actions">' +
                    '<button class="reply-compose-submit reply_add_btn" data-parent-id="' + commentId + '" data-depth="' + (currentDepth + 1) + '">게시</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';

    // 모달을 body에 추가하고 표시
    $('body').append(modalHtml);
    $('body').css('overflow', 'hidden'); // 배경 스크롤 막기
    
    // 다른 모든 요소들의 z-index를 강제로 낮춤
    $('*').not('.reply-compose-modal, .reply-compose-modal *').each(function() {
      var currentZIndex = $(this).css('z-index');
      if (currentZIndex !== 'auto' && parseInt(currentZIndex) > 1000) {
        $(this).data('original-z-index', currentZIndex);
        $(this).css('z-index', '999');
      }
    });
    
    $('#reply-compose-modal').css({
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center'
    }).hide().fadeIn(300);
    
    // 텍스트 영역에 포커스
    setTimeout(function() {
      $('.reply-compose-textarea').focus();
    }, 300);
  }
  


  
  // 답글 작성 모달 닫기 함수
  window.closeReplyComposeModal = function() {
    $('#reply-compose-modal').fadeOut(300, function() {
      $(this).remove();
      $('body').css('overflow', 'auto'); // 배경 스크롤 복원
      
      // 원래 z-index 복원
      $('*').each(function() {
        var originalZIndex = $(this).data('original-z-index');
        if (originalZIndex) {
          $(this).css('z-index', originalZIndex);
          $(this).removeData('original-z-index');
        }
      });
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

  $(document).on("click", ".add_comment_btn", function (e) {
    e.preventDefault();

    var isInModal = $(this).closest('.new-thread-modal').length > 0;
    var msg, errorStatusElement;
    
    if (isInModal) {
      msg = $(this).closest('.new-thread-modal').find(".comment_textbox").val();
      errorStatusElement = $(this).closest('.new-thread-modal').find("#modal-error-status");
    } else {
      msg = $(".comment_textbox").val();
      errorStatusElement = $("#error_status");
    }
    
    if ($.trim(msg).length == 0 && selectedFiles.length == 0) {
      error_msg = "댓글 내용이나 파일을 입력해주세요";
      errorStatusElement.text(error_msg);
      return false;
    } else {
      error_msg = "";
      errorStatusElement.text(error_msg);
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
          if (isInModal) {
            // 모달에서 작성한 경우
            closeNewThreadModal();
            // 성공 메시지는 모달 밖에서 표시
            $("#error_status").html('<div style="color: #4CAF50; padding: 8px; background: rgba(76, 175, 80, 0.1); border-radius: 4px; margin-bottom: 12px;">게시물이 성공적으로 작성되었습니다!</div>');
          } else {
            // 일반 페이지에서 작성한 경우
            errorStatusElement.html('<div style="color: #4CAF50; padding: 8px; background: rgba(76, 175, 80, 0.1); border-radius: 4px; margin-bottom: 12px;">게시물이 성공적으로 작성되었습니다!</div>');
            
            // 입력 필드 초기화
            $(".comment_textbox").val("");
            selectedFiles = [];
            $("#media-preview").empty();
            $("#media-files").val('');
          }
          
          // 댓글 목록 새로고침 (현재 활성 피드에 따라)
          var currentFeed = $('.current-feed').text();
          if (currentFeed === '팔로잉') {
            loadFollowingFeed();
          } else {
            load_comment();
          }
          
          // 성공 메시지를 3초 후 제거
          setTimeout(function() {
            $("#error_status").html("");
          }, 3000);
        } else if (response.error) {
          errorStatusElement.html('<div style="color: #f44336; padding: 8px; background: rgba(244, 67, 54, 0.1); border-radius: 4px; margin-bottom: 12px;">' + response.error + '</div>');
        }
      },
      error: function (xhr, status, error) {
        alert("댓글 추가 실패: " + error);
      },
    });
  });

  // 현재 사용자 프로필 정보 로드
  function loadCurrentUserProfile() {
    $.ajax({
      url: "code.php",
      method: "POST",
      data: {
        get_user_profile: 1
      },
      dataType: "json",
      success: function(response) {
        console.log("프로필 로드 응답:", response);
        if (response.success) {
          currentUserProfile.fullname = response.fullname;
          currentUserProfile.profile_image = response.profile_image;
          
          console.log("프로필 이미지 업데이트:", currentUserProfile.profile_image);
          
          // 메인 트리거 영역의 아바타 업데이트
          $('#profile-avatar').attr('src', currentUserProfile.profile_image);
          // 모달 안의 아바타도 업데이트 (모달이 열려있을 때)
          $('.new-thread .user-avatar').attr('src', currentUserProfile.profile_image);
          
          console.log("프로필 아바타 업데이트 완료");
        } else {
          console.log("프로필 로드 실패:", response);
        }
      },
      error: function(xhr, status, error) {
        console.log("프로필 로드 실패:", error);
      }
    });
  }

  // 프로필 이미지 업로드 기능
  $(document).on('click', '#profile-avatar', function() {
    $('#profile-image-input').click();
  });

  $(document).on('change', '#profile-image-input', function() {
    var file = this.files[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showProfileUploadStatus('파일 크기가 너무 큽니다 (최대 5MB)', 'error');
      return;
    }

    // 이미지 파일 체크
    if (!file.type.startsWith('image/')) {
      showProfileUploadStatus('이미지 파일만 업로드 가능합니다', 'error');
      return;
    }

    var formData = new FormData();
    formData.append('profile_image', file);
    formData.append('upload_profile_image', 1);

    $.ajax({
      url: 'code.php',
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      dataType: 'json',
      success: function(response) {
        if (response.success) {
          // 프로필 이미지 업데이트
          currentUserProfile.profile_image = response.profile_image;
          
          // 모든 프로필 이미지 업데이트
          $('#profile-avatar').attr('src', response.profile_image);
          $('.new-thread .user-avatar').attr('src', response.profile_image);
          
          console.log("프로필 이미지 업로드 후 모든 아바타 업데이트:", response.profile_image);
          
          showProfileUploadStatus('프로필 이미지가 업데이트되었습니다!', 'success');
          
          // 파일 입력 초기화
          $('#profile-image-input').val('');
        } else {
          showProfileUploadStatus(response.error || '업로드 실패', 'error');
        }
      },
      error: function(xhr, status, error) {
        showProfileUploadStatus('업로드 중 오류가 발생했습니다', 'error');
      }
    });
  });

  // 프로필 업로드 상태 메시지 표시
  function showProfileUploadStatus(message, type) {
    var statusDiv = $('#profile-upload-status');
    statusDiv.removeClass('success error show');
    statusDiv.addClass(type);
    statusDiv.text(message);
    statusDiv.addClass('show');
    
    setTimeout(function() {
      statusDiv.removeClass('show');
    }, 3000);
  }
});
