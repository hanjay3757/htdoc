<!-- mysql 연결 -->
<?php
//mysqli oop
$servername = "localhost";
$username = "root";
$password = "";


// $conn = new mysqli( $servername, $username, $password, $dbname );
// $conn = mysqli_connect( $servername, $username, $password );

// if ($conn->connect_error) {
//     echo "DB 연결에 실패했습니다.";
//     echo $conn->connect_error;
//     exit();
// } else {
//     echo "DB 연결에 성공했습니다.";
// }

if (!$conn) {
    // echo "DB 연결에 실패했습니다.";
    // exit(); = die
    die("DB 연결에 실패했습니다.");
}
echo "DB 연결에 성공했습니다.";
?>
