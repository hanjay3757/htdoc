<?php
session_start();
include('include/header.php');
?>

<?php
if (isset($_SESSION['status'])) {
?>
    <div class="alert">
        <?= $_SESSION['status']; ?>
    </div>
<?php unset($_SESSION['status']);
} ?>

<!-- Simple Threads Feed Layout -->
<div class="threads-app">
    <div class="container">
        <!-- New Thread Composer -->
        <div class="new-thread">
            <div class="thread-input-area">
                <img src="assets/default-avatar-40.png" alt="프로필" class="user-avatar">
                <div class="input-wrapper">
                    <textarea class="comment_textbox thread-input" placeholder="무슨 일이 일어나고 있나요?"></textarea>
                    <div class="input-actions">
                        <label for="media-files" class="attach-btn">
                            <i class="fas fa-image"></i>
                        </label>
                        <input type="file" id="media-files" multiple accept="image/*,video/*,.gif" style="display: none;">
                        <button class="post-btn add_comment_btn">게시</button>
                    </div>
                </div>
            </div>
            <div id="media-preview" class="media-preview"></div>
            <div id="error_status" class="error-msg"></div>
        </div>

        <!-- Threads Feed -->
        <div class="comment-container feed"></div>
    </div>
</div>

<!-- Font Awesome and Fonts -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<?php include('include/footer.php'); ?>