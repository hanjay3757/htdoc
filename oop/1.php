<?php
class Fruits{
    public $name;
    public $color;

    // set_name 메서드를 Fruits 클래스 안에 넣기
     function set_name($name){
        $this->name = $name;
    }

    // get_name 메서드를 Fruits 클래스 안에 넣기
     function get_name(){
        return $this->name;
    }
    function get_color(){
        return $this->color;
    }

    //생성사 constructor
    function __construct($name,$color){
        $this->name = $name;
        $this->color = $color;
    }
}

$apple = new Fruits("사과","red");
$banana = new Fruits("바나나","yellow");
echo "이 과일의 이름은 " . $apple->get_name();
echo  "이고 색깔은 " . $apple->get_color() . "입니다.<br>";
echo "이 과일의 이름은 " . $banana->get_name();
echo  "이고 색깔은 " . $banana->get_color() . "입니다.<br>";
// $apple->set_name('Apple');
// $banana->set_name('Banana');

// // echo $apple->get_name();  // Apple 출력
// // echo "<br>";
// // echo $bababa ->get_name();


// echo $banana->name; //publi 속성이라 접근 가능
// echo $banana->get_name(); //publi 속성이라 접근 가능
// ?>
