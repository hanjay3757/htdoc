<?php

session_start(); 
$db = mysqli_connect('localhost', 'root', '', 'userdata') or die('Unable to connect. Check your connection parameters.');

if(isset($_POST['submit'])){
    $category = 'To-do';
    $pageid = $_GET['Login_board_id'];  //게시글 아이디
    $id = $_SESSION['Login_id'];  //로그인한 아이디
    $chat = $_POST['comment'];
    $time = date("Y-m-d H:i:s");
    $query = "INSERT INTO userchattable (User_page_id, Login_chat_id, Login_chat_category, Chat_message, Chat_date) VALUES ( '$pageid', '$id','$category', '$chat', '$time')";
    mysqli_query($db, $query) or die(mysqli_error($db));
    header("Location: TodoView.php?Login_board_id={$_GET['Login_board_id']}");
    exit;
}
?>


  <div>
            <?php
          $User_page_id = $_GET['Login_board_id']; // 게시글 아이디
          $login_chat_category = 'To-do'; //  게시글의 카테고리
          
          $query = "SELECT * FROM userchattable WHERE User_page_id='$User_page_id' AND Login_chat_category='$login_chat_category'";  
          //카테고리와 게시글 아이디가 일치하는 데이터만
          $result = mysqli_query($db, $query);
            while ($row = mysqli_fetch_assoc($result)) {
              
                echo "<div class='chat-title'><div>{$row['Login_chat_id']}</div>";
                echo "<div>{$row['Chat_date']}</div></div>";
                echo "<div class='chat-wrap'>";
                echo "<div>{$row['Chat_message']}</div>";
                echo "</div>";
            }
            ?>
        </div>
        <div class="form-wrap">
            <button class="comment-button" onclick="toggleForm()">댓글 쓰기</button>

            <div class="comment-form">
                <form id="commentForm" method="post" action="">
                    <textarea name="comment" placeholder="댓글을 입력하세요"></textarea>
                    <button class="addBtn" name="submit" type="submit">등록</button>
                </form>
            </div>
        </div>
    </div>