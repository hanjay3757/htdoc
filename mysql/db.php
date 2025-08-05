<?php 
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "atest";

try{
    $conn = new PDO("mysql:host=$servername;dbname=$dbname",$username, $password);
$conn ->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "연결 실패: " . $e->getMessage();
    exit;
}