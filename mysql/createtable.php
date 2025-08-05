<?php 
$servername = "localhost";
$username = "root";
$password = "";

try{
    $conn = new PDO("mysql:host=$servername;dbname=atest",$username, $password);
$conn ->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
echo "DB 연결에 성공했습니다.ㄸㄸㄷ";
} catch (PDOException $e) {
    echo "연결 실패: " . $e->getMessage();
    exit;
}
//db 생성
$sql = "CREATE DATABASE IF NOT EXISTS atest";


// 테이블 생성 ;
try{
$sql = "CREATE TABLE IF NOT EXISTS MyGuests(
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
firstname VARCHAR(30) NOT NULL,
lastname VARCHAR(30) NOT NULL,
email VARCHAR(50),
reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)";
echo "테이블 생성 성공";
$conn->exec($sql);}catch(PDOException $e) {
    echo "테이블 생성 실패: " . $e->getMessage();
}