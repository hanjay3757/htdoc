<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container">
    <!-- 왼쪽 로고 -->
    <a class="navbar-brand" href="#">Navbar</a>

    <!-- 모바일용 버튼 -->
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
      data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
      aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- 우측 메뉴들 -->
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav ms-auto d-flex align-items-center gap-3">
        <li class="nav-item">
          <a class="nav-link active text-white" aria-current="page" href="#">Home</a>
        </li>
        <li class="nav-item">
          <?php if (!isset($_SESSION['auth_user_id'])) { ?>
            <a class="nav-link text-white" href="#" data-bs-toggle="modal" data-bs-target="#LoginModal">Login</a>
          <?php } else { ?>
            <a class="nav-link text-white" href="logout.php">Logout</a>
          <?php } ?>
        </li>
        <li class="nav-item">
          <?php if (isset($_SESSION['authuser_name'])) { ?>
            <span class="nav-link text-white">
              <?= $_SESSION['authuser_name'] ?>님 환영합니다!
            </span>
          <?php } ?>
        </li>
      </ul>
    </div>
  </div>
</nav>