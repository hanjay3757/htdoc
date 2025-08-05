 <table class="list-table">
            <thead>
                <tr>
                    <th width="70">번호</th>
                    <th width="110">카테고리</th>
                    <th width="120">글쓴이</th>
                    <th width="500">작성일</th>
                    <th width="100">추천수</th>
                    <th width="100">조회수</th>
                </tr>
            </thead>
            <tbody>
                <?php
        // 데이터베이스에서 가져온 각각의 레코드에 대해 반복하여 출력
        $db = mysqli_connect('localhost', 'root', '', 'userdata') or die('Unable to connect. Check your connection parameters.');
        $sql = mysqli_query($db, "SELECT * FROM userboardtable ORDER BY SID DESC LIMIT 0,10");
        $num =1;
        while ($board = mysqli_fetch_assoc($sql)) {
            ?>
                <tr>
                    <td width="70"><?php echo $num ?></td>
                    <td width="110">
                        <?php echo "<a href='TodoView.php?Login_id={$_SESSION['Login_id']}&Login_board_id={$board['Login_board_id']}'/>"?><?php echo $board['Board_category']; ?>
                    </td>
                    <td width="120"><?php echo $board['Login_board_id']; ?></td>
                    <td width="500"><?php echo $board['Create_board_date']; ?></td>
                    <td width="100"><?php echo $board['Board_thumb']; ?></td>
                    <td width="100"><?php echo $board['Board_view']; ?></td>
                </tr>
                <?php
                $num++;
        }
        ?>
            </tbody>
        </table>