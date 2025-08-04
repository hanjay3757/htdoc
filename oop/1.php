<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>과일 정보</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f0f8ff;
            padding: 30px;
        }

        .fruit {
            background-color: #fff;
            border: 1px solid #ddd;
            border-left: 8px solid #ffa500;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
            width: 300px;
        }

        .fruit h2 {
            margin: 0 0 10px 0;
            color: #333;
        }

        .fruit p {
            margin: 0;
            color: #666;
        }
    </style>
</head>
<body>

<?php
class Fruits {
    public $name;
    public $color;

    function set_name($name){
        $this->name = $name;
    }

    function get_name(){
        return $this->name;
    }

    function get_color(){
        return $this->color;
    }

    function __construct($name, $color){
        $this->name = $name;
        $this->color = $color;
    }
}

$apple = new Fruits("사과", "red");
$banana = new Fruits("바나나", "yellow");

function displayFruit($fruit) {
    echo "<div class='fruit'>";
    echo "<h2>" . $fruit->get_name() . "</h2>";
    echo "<p>색깔: " . $fruit->get_color() . "</p>";
    echo "</div>";
}

displayFruit($apple);
displayFruit($banana);
?>

</body>
</html>
