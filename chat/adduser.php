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
	$onlogin = null;
	$sql1 = "SELECT id FROM user WHERE login = 1 order by rand() LIMIT 1";
	$result1 = $conn->query($sql1);
	if ($result1->num_rows > 0) {
		$row = $result1->fetch_assoc();
		$onlogin = $row["id"];
	};

	$get_username = $_GET['username'];
	$get_room = $_GET['roomid'];
	$sql = "SELECT * FROM user WHERE username = '{$get_username}'";
	$result = $conn->query($sql);
	if ($result->num_rows > 0) {
		$arr = null;
		while($row = $result->fetch_assoc()) {
			$oArr = $row["rooms"].','.$get_room;
			$oArr = implode(',',array_unique(explode(',',$oArr)));
			$sql = "update user set login=1, rooms = '{$oArr}' where username = '{$get_username}'";
			$conn->query($sql);
			if($row["id"] == $onlogin){
				$onlogin = null;
			};
			$arr = array ('id'=>$row["id"],'loginid'=>$onlogin);
		}	
		echo json_encode($arr);
	}else{
		$sql = "INSERT INTO user (username, rooms,login) VALUES ('{$get_username}', '{$get_room}',1)";
		$conn->query($sql);
		$id = $conn->insert_id;
		if($id == $onlogin){
			$onlogin = null;
		}
		$arr = array ('id'=>$id,'loginid'=>intval($onlogin));
		echo json_encode($arr);
	}

 ?>
