<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JWT 로그인 시스템</title>
    <!-- 
        JWT 로그인 시스템 - 메인 로그인 페이지
    -->
    <script src="login.js"></script>
</head>
<body>
    <h1>JWT 로그인 시스템</h1>
    
    <!-- 
        로그인 폼
    -->
    <form action="login_ok.php" name="login_form" method="post">
        <label for="id">아이디</label>
        <input type="text" name="id" id="id" required>
        <br>
        
        <label for="pw">비밀번호</label>
        <input type="password" name="pw" id="pw" required>
        <br>
        
        <button id="login_btn" type="submit">로그인</button>
    </form>
    
    <a href="member.php">회원전용페이지</a>
    
</body>
</html>