<?php
session_start();

if (isset($_SESSION['s_name'])) {
    echo "name : " . $_SESSION['s_name'] . '입니다.<br>';
} else {
    echo "no session.<br>";
}
if (isset($_SESSION['s_age'])) {
    echo "age" . $_SESSION['s_age'] . '입니다.<br>';
    
} else {
    echo "no  age session.<br>";
    
}




?>

<a href="3.php">세션 삭제</a>