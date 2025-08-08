<?php
session_start();
include('include/header.php');
include('include/navbar.php');  ?>

<?php
if (isset($_SESSION['status'])) {
?>
    <div class="alert">
        <?= $_SESSION['status']; ?>
    </div>
<?php unset($_SESSION['status']);
} ?>


<div class="py-5">
    <div class="contaioner">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header mt-2">
                        <h4>test</h4>
                    </div>
                    <div class="card-body">
                        <p>이곳은 회원 전용 페이지입니다.</p>
                        <p>로그인 후에만 접근할 수 있습니다.</p>
                        <p>환영합니다, <?= isset($_SESSION['authuser_name']) ? $_SESSION['authuser_name'] : '게스트'; ?>님!</p>
                        <p>이 페이지는 JWT 인증을 사용하여 보호됩니다.</p>
                        <hr>
                        <div class="main-comment">
                            <div id="error_status"></div>
                            <textarea class="comment_textbox form-control mb-3" rows="6" placeholder="댓글을 입력하세요..."></textarea>

                            <!-- 미디어 파일 업로드 영역 -->
                            <div class="media-upload-section mb-3">
                                <div class="d-flex align-items-center gap-2 mb-2">
                                    <label for="media-files" class="btn btn-outline-secondary btn-sm">
                                        <i class="fas fa-paperclip"></i> 파일 첨부
                                    </label>
                                    <input type="file" id="media-files" multiple accept="image/*,video/*,.gif" style="display: none;">
                                    <small class="text-muted">이미지, 영상, GIF 파일을 업로드할 수 있습니다 (최대 10MB)</small>
                                </div>

                                <!-- 선택된 파일 미리보기 -->
                                <div id="media-preview" class="media-preview-container"></div>
                            </div>

                            <button type="button" class="btn btn-primary add_comment_btn">댓글 작성</button>
                        </div>
                        <hr>

                        <div class="comment-container"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Font Awesome for icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<?php include('include/footer.php'); ?>