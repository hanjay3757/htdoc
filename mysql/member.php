<?php
include "db.php";

$sql = "SELECT * FROM MyGuests";
$stmt = $conn->prepare($sql);
$stmt->execute();
$rs = $stmt->fetchAll(PDO::FETCH_BOTH);


echo "<table border = '1'>
 <tr><th>First Name</th>
<th>Last Name</th>
<th>Email</th>
<th>Registration Date</th>
</tr>";


foreach($rs As $row){
    echo "<tr>
    <td>".$row['firstname']."</td>
    <td>".$row['lastname']."</td>
    <td>".$row['email']."</td>
    <td>".$row['reg_date']."</td>
    </tr>";
}
echo "</table>";

// PDO::FETCH_ASSOC 연관배열로 가져오기
// PDO::FETCH_NUM 숫자 인덱스 배열로 가져오기
// PDO::FETCH_OBJ 객체로 가져오기
// PDO::FETCH_LAZY 지연 로딩
// PDO::FETCH_BOUND 바인딩된 변수로 가져오기
// PDO::FETCH_CLASS 클래스로 가져오기
// PDO::FETCH_COLUMN 지정된 컬럼만 가져오기
// PDO::FETCH_UNIQUE 유일한 값으로 가져오기
// PDO::FETCH_KEY_PAIR 키-값 쌍으로 가져오기
// PDO::FETCH_BOTH 디폴트값