<?php
// POST 요청 시뮬레이션
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// JSON 입력 시뮬레이션
$input_data = ['id' => 'guest', 'pw' => '1234'];
file_put_contents('php://temp', json_encode($input_data));
rewind(fopen('php://temp', 'r'));

// login_ok.php 실행
ob_start();
include 'login_ok.php';
$output = ob_get_clean();

echo "Response: " . $output . "\n";
?> 