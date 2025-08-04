<?php
$age = array("peter" => 20, "ben" => 21, "joe" => 22);
// php 연결 배열 => json 배열
// echo json_encode($age);

$json = `{"peter":35, "ben":37, "joe":43}`;

//  var_dump(json_decode($json, true));
// $obj = json_decode($json);
// echo $obj->peter;
$json = '{"peter":35, "ben":37, "joe":43}';
$arr = json_decode($json, true);
// echo $arr["peter"];÷
foreach($arr as $key => $value){
    echo $key. "는" . $value . "<br>";
}

?>
