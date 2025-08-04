<?php
/**
 * JWT 로그인 시스템 - 서버 사이드 인증 처리
 */

// ===== 디버깅 설정 =====
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ===== JWT 라이브러리 로드 =====
// Composer를 통한 firebase/php-jwt 라이브러리 로드
require __DIR__ . '/vendor/autoload.php';

// JWT 클래스 사용 선언
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// ===== 메인 로그인 처리 로직 =====
try {
    // JSON 응답 헤더 설정
    header('Content-Type: application/json');
    
    // ===== 디버깅: 요청 정보 로깅 =====
    error_log("Request Method: " . ($_SERVER['REQUEST_METHOD'] ?? 'NOT SET'));
    error_log("Content Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'NOT SET'));
    
    // ===== 요청 방식 확인 및 데이터 추출 =====
    $request_method = $_SERVER['REQUEST_METHOD'] ?? 'POST';
    
    if ($request_method === 'GET') {
        $id = $_GET['id'] ?? '';
        $pw = $_GET['pw'] ?? '';
    } else {
        // JSON 형태로 전송된 데이터를 PHP 배열로 
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? '';
        $pw = $input['pw'] ?? '';
    }
    
    // ===== 입력값 검증 =====
    if ($id == '' || $pw == '') {
        echo json_encode(['message' => '아이디와 비밀번호를 입력하세요.']);
        exit;
    }
    
    // ===== 로그인 인증 처리 =====
    if ($id == 'guest' && $pw == '1234') {
        // ===== JWT 토큰 생성 =====
        
        // JWT 서명용 비밀키
        $key = 'your_secret_key';
        
        // JWT 페이로드 구성
        $payload = [
            'id' => $id,                    // 사용자 ID
            'exp' => time() + 3600          // 만료 시간 (1시간 후)
        ];
        
        // JWT 토큰 생성 (HS256 알고리즘 사용)
        $jwt = JWT::encode($payload, $key, 'HS256');
        
        // 성공 응답: JWT 토큰 반환
        echo json_encode(['token' => $jwt]);
        
    } else {
        // ===== 로그인 실패 처리 =====
        echo json_encode(['message' => '아이디 또는 비밀번호가 틀립니다.']);
    }
    
} catch (Exception $e) {
    // ===== 예외 처리 =====
    // JWT 라이브러리 오류나 기타 예외 상황 처리
    echo json_encode(['error' => $e->getMessage()]);
}
?>
