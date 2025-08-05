<?php
$servername = "127.0.0.1";
$username = "root";
$password = "";
 phpinfo();

try { 
    $conn =  new PDO("mysql:host=$servername", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<p>DB 연결에 성공했습니다.";

} catch (PDOException $e) {
echo $e ->getmessage();
    exit()
    ;}
try{
    $dbname = "aaa";
    $sql = "DROP DATABASE".$dbname;
    $conn->exec($sql);
    echo "<p>" . $dbname . "가 삭제되었습니다.</p>";
}catch (PDOException $e) {
   
    echo "<p>데이터베이스 삭제 실패: " . $e->getMessage() . "</p>";
}