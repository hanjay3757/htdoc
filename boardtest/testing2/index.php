<?php
session_start();
include('include/header.php'); 
include('include/navbar.php');  ?>
<h4><?php
if(isset($_SESSION['authuser_name'])){
    echo $_SESSION['authuser_name'] . "님 환영합니다!";
}

?></h4>
 
<?php include('include/footer.php'); ?>