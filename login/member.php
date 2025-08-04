<?php
/**
 * JWT 로그인 시스템 - 회원 전용 페이지
 * 
 * 역할:
 * - JWT 토큰 검증 및 사용자 인증
 * - 인증된 사용자에게만 접근 허용
 * - 사용자 정보 표시
 */

// ===== 기존 세션 기반 인증  =====
/*
session_start();
if(isset($_SESSION['s_name']) && isset($_SESSION['s_age'])) {
    // 세션이 설정되어 있으면 회원 전용 페이지 내용 표시;
} else {
    // 세션이 설정되어 있지 않으면 로그인 페이지로 리다이렉트  
    header('Location: index.php');
    exit;
}
if(!isset($_SESSION['s_id']) or $_SESSION['s_id'] == ''){
    echo "
    <script>
    alert('로그인 후 이용하세요.');
    history.go(-1);
    self.location.href='index.php'; // 로그인 폼으로 이동
    </script>
    ";
    exit;
}
*/


// JWT 라이브러리 로드
require __DIR__ . '/vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// ===== JWT 토큰 확인 =====
// 쿠키에서 JWT 토큰 가져오기 
$token = $_COOKIE['jwt'] ?? null;

// 토큰이 없으면 로그인 페이지로 리다이렉트
if (!$token) {
    echo "
    <script>
    alert('로그인 후 이용하세요.');
    window.location.href='index.php';

    </script>
    ";
    exit;
}

// ===== JWT 토큰 검증 =====
try {
    $key = 'your_secret_key';
    
    // JWT 토큰 디코딩 및 검증
    $decoded = JWT::decode($token, new Key($key, 'HS256'));
    
    // ===== 토큰 만료 시간 확인 =====
    if (isset($decoded->exp) && $decoded->exp < time()) {
        echo "
        <script>
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href='index.php';
        </script>
        ";
        exit;
    }
    
    // 토큰에서 사용자 ID 추출
    $user_id = $decoded->id;
    
} catch (Exception $e) {
    // ===== 토큰 검증 실패 처리 =====
    echo "
    <script>
    alert('유효하지 않은 토큰입니다. 다시 로그인해주세요.');
    window.location.href='index.php';
    </script>
    ";
    exit;
}
?>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회원 전용 페이지</title>
</head>
<body>
    <h1>회원 전용 페이지</h1>
    
   
    <p>어서오세요 <strong><?php echo htmlspecialchars($user_id); ?></strong>님! 회원 전용 페이지입니다.</p>
    
    <h2>JWT 토큰 정보:</h2>
    <ul>
        <!-- 사용자 ID 표시 (XSS 방지) -->
        <li>사용자 ID: <?php echo htmlspecialchars($user_id); ?></li>
        
        <!-- 토큰 만료 시간 표시 -->
        <li>토큰 만료 시간: <?php echo date('Y-m-d H:i:s', $decoded->exp); ?></li>
    </ul>

    <!-- 로그아웃 링크 -->
    <p><a href="logout.php">로그아웃</a></p>
    
   
</body>
</html>