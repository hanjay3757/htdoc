<?php
//mySQLi oop
$servername = "localhost";
$username = "root";
$password = "";

// 1 $conn = new mysqli($servername, $username, $password);


// if($conn -> connect_error){
//     echo "DB 연결에 실패해습니다.";
//     echo $conn->connect_error;
//     exit();
// }echo "DB 연결에 성공했습니다.";
 

//2 $conn = mysqli_connect($servername, $username, $password);

// if(!$conn){
//     die("DB 연결에 실패했습니다.");

//     exit();
// } else {
//     echo "DB 연결에 성공했습니다.";
// }



try{
$conn = new PDO("mysql:host=$servername", $username, $password);    
}catch(PDOException $e){}
?>