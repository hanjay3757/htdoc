<?php
session_start();
// session_unset();
// session_destroy();

//부분적으로 삭제 
unset($_SESSION['s_age']);


?>
<a href="2.php">세션확인</a>