<?php

$servername = "localhost";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=$servername", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "DB 연결에 성공했습니다.";
} catch (PDOException $e) {
    echo "연결 실패: " . $e->getMessage();
    exit;
}


// try{

//     $sql = "CREATE DATABASE firstdb"; sql 에 firstdb 데이터베이스 생성;
//      $dbname = "aaa";
//     "Drop DATABASE".$dbname;  데이터베이스가 존재하면 삭제
// 	$conn->exec($sql);   수행 
// 	echo "데이터베이스 생성 성공";

// }catch(PDOException $e) {
//     echo $e-> getMessage();
    

// }


$conn = null; // 연결 종료
?>
