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
                <svg width="28" height="28" viewBox="0 0 192 192" fill="currentColor">
                    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.227 56.9538 167.231 45.7381 153.479C35.2355 140.607 29.8077 120.8 29.7518 96C29.8077 71.2 35.2355 51.3928 45.7381 38.5207C56.9538 24.7691 74.2039 17.7733 97.0132 16.9405C119.988 17.7645 137.539 24.9382 148.184 38.5633C154.439 47.4062 158.199 58.319 159.27 70.6837C160.238 81.8602 159.503 93.9517 157.152 106.75C154.46 121.427 149.687 135.122 142.37 147.795C134.927 160.725 124.683 172.357 111.653 182.136C97.1135 192.957 79.1992 197.487 58.5293 194.957C39.0492 192.5 22.5766 185.446 10.2949 173.33C-2.74751 160.479 -9.1266 144.465 -8.98334 126.349C-9.13331 108.464 -2.49867 92.4958 10.5292 79.6781C22.8123 67.5577 39.0492 60.4839 58.5293 58.0266C78.7224 55.5016 97.8953 59.2238 113.204 67.3901C120.647 71.6347 126.724 77.2803 130.936 84.3747C133.754 89.2973 135.715 94.9267 136.357 101.402C136.403 101.893 136.422 102.394 136.422 102.898C136.422 119.968 122.317 133.548 105.277 133.548C88.2312 133.548 74.1270 119.968 74.1270 102.898C74.1270 85.8333 88.2312 72.2578 105.277 72.2578C108.669 72.2578 111.931 72.9618 114.895 74.2618C115.675 74.6101 116.404 75.0141 117.071 75.4699C118.216 76.2618 119.235 77.2578 120.089 78.4618C121.943 81.0141 122.317 84.4618 122.317 87.8618C122.317 91.2618 121.943 94.7095 120.089 97.2618C119.235 98.4658 118.216 99.4618 117.071 100.254C116.404 100.71 115.675 101.114 114.895 101.462C111.931 102.762 108.669 103.466 105.277 103.466C95.4577 103.466 87.4577 95.4658 87.4577 85.6465C87.4577 75.8272 95.4577 67.8272 105.277 67.8272C115.096 67.8272 123.096 75.8272 123.096 85.6465C123.096 95.4658 115.096 103.466 105.277 103.466Z" />
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
            <div class="header-tabs">
                <button class="tab-btn active">추천</button>
                <button class="tab-btn">팔로잉</button>
            </div>
        </div>

        <!-- Main Feed Container -->
        <div class="feed-container">
            <!-- New Thread Composer -->
            <div class="new-thread">
                <div class="thread-input-area">
                    <img src="assets/default-avatar-40.png" alt="프로필" class="user-avatar profile-upload-trigger" id="profile-avatar">
                    <input type="file" id="profile-image-input" accept="image/*">
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


</div>

<!-- 프로필 업로드 상태 메시지 -->
<div id="profile-upload-status" class="profile-upload-status"></div>

<!-- Font Awesome and Fonts -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<?php include('include/footer.php'); ?>