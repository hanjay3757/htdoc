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

<!-- Threads App Layout -->
<div class="threads-app">
    <!-- Left Sidebar -->
    <div class="sidebar">
        <div class="sidebar-header">
            <div class="threads-logo">
                <svg width="28" height="28" viewBox="0 0 192 192" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="bird logo">
                    <path d="M96 40c-35 0-64 29-64 64s29 64 64 64c14 0 27-4 38-11l22 16c6 4 14 3 18-3s2-13-4-17l-22-14c6-10 10-22 10-35 0-35-29-64-64-64Zm-8 105c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5Zm26 0c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5ZM74 148l-9 10c-2 2-1 6 2 7h10c4 0 6-5 3-8l-6-9Zm68-87c4 5 7 12 7 20 0 5-1 10-3 14-11-5-24-7-38-7-18 0-34 4-45 11 2-21 18-35 39-37 17-2 32 2 40 9Z" />
                </svg>
            </div>

        </div>

        <nav class="sidebar-nav">
            <a href="#" class="nav-item active">
                <i class="fas fa-home"></i>
                <span>홈</span>
            </a>
            <a href="#" class="nav-item">
                <i class="fas fa-search"></i>
                <span>검색</span>
            </a>
            <a href="#" class="nav-item">
                <i class="fas fa-edit"></i>
                <span>새 스레드</span>
            </a>
            <a href="#" class="nav-item">
                <i class="fas fa-heart"></i>
                <span>활동</span>
            </a>
            <a href="#" class="nav-item">
                <i class="fas fa-user"></i>
                <span>프로필</span>
            </a>
        </nav>

        <div class="sidebar-footer">
            <a href="#" class="nav-item">
                <i class="fas fa-bars"></i>
                <span>더보기</span>
            </a>
        </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
        <!-- Top Header -->
        <div class="top-header">
            <div class="header-content">
                <div></div> <!-- 왼쪽 공간 -->
                <div class="feed-selector">
                    <button class="feed-dropdown-btn" id="feed-dropdown">
                        <span class="current-feed">추천</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="feed-dropdown-menu" id="feed-dropdown-menu">
                        <div class="feed-option active" data-feed="recommend">추천</div>
                        <div class="feed-option" data-feed="following">팔로잉</div>
                    </div>
                </div>
                <div></div> <!-- 오른쪽 공간 -->
            </div>
        </div>

        <!-- Main Feed Container -->
        <div class="feed-container">
            <!-- New Thread Trigger -->
            <div class="new-thread-trigger">
                <div class="thread-trigger-area">
                    <img src="assets/default-avatar-40.png" alt="프로필" class="user-avatar profile-upload-trigger" id="profile-avatar">
                    <input type="file" id="profile-image-input" accept="image/*">
                    <div class="trigger-input" id="open-post-modal">
                        <span class="trigger-placeholder">무슨 일이 일어나고 있나요?</span>
                    </div>
                    <button class="trigger-post-btn" id="trigger-post-btn">게시</button>
                </div>
            </div>

            <!-- Status Messages -->
            <div id="error_status" class="error-msg" style="margin: 0 24px;"></div>

            <!-- Threads Feed -->
            <div class="comment-container feed"></div>
        </div>
    </div>


</div>

<!-- 프로필 업로드 상태 메시지 -->
<div id="profile-upload-status" class="profile-upload-status"></div>

<!-- Font Awesome and Fonts -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<?php include('include/footer.php'); ?>