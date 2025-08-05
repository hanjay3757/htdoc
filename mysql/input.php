<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>글등록 Form</title>
</head>
<body>
    <form method="post" action="input_ok.php">
        <label>글제목</label>
        <input type="text" name="subject" class="name_input"><br> 
        <label>글내용</label>
        <textarea name ="content" id="content" cols="30" rows="10"></textarea><br>
        <label>작성자</label>
        <input type="text" name="writer" class="name_input"><br>
        <input type="submit" value="글등록" class="submit_btn">
    </form>

    <form method="post" action="comment_ok.php">
        <input type="hidden" name="board_id" value="1"> <!-- 글 ID -->
        <input type="hidden" name="parent_id" value="1"> <!-- 부모 댓글 ID (없으면 0 또는 null) -->
        <textarea tarea name="content" placeholder="댓글을 입력하세요"></textarea>
        <input type="text" name="writer" placeholder="작성자">
        <input type="submit" value="댓글 달기">
    </form>

    
</body>
</html>