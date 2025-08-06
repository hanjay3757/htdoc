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
                            <textarea class="comment_textbox form-control mb-1" rows="3"></textarea>
                            <button type="button" class="btn btn-primary add_comment_btn">Comment</button>
                        </div>
                        <hr>

                        <div class="comment-container"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include('include/footer.php'); ?>