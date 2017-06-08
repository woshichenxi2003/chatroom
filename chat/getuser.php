<?php
	header("Content-type: text/html; charset=utf-8");
	$servername = 'localhost';
	$username = 'root';
	$password = '';
	$dbname = 'chatdb';
	$conn = new mysqli($servername,$username,$password,$dbname);
	$conn->query("SET NAMES utf8");
	if($conn->connect_error){
		die("连接失败：".$conn->connect_error);
	};
	$get_room = $_GET['roomid'];
	$sql = "SELECT * FROM user order by id desc";
	$result = $conn->query($sql);
	if ($result->num_rows > 0) {
		$Arr = array();
		while($row = $result->fetch_assoc()) {
			$rooms = explode(',',$row['rooms']);
			if(in_array($get_room ,$rooms)){
				$arr = array ('rooms'=>$row["rooms"],'username'=>$row["username"]);
				Array_push($Arr, $arr);
			}
			
		}
		echo json_encode($Arr);
	}else{
		echo '没有此房间信息';
	}

 ?>
