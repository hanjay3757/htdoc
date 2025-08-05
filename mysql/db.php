<?php 
$servername = "localhost";
$username = "root";
$password = "";

try{
    $conn = new PDO("mysql:host=$servername;dbname=texttest",$username, $password);
$conn ->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
echo "DB 연결에 성공했습니다.";
} catch (PDOException $e) {
    echo "연결 실패: " . $e->getMessage();
    exit();
}