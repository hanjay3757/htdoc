<?php
session_start();

unset($_SESSION['auth_user_id']);
unset($_SESSION['authuser_name']);
$_SESSION['status'] = "로그아웃 되었습니다.";
header('Location: index.php');
exit();


?>