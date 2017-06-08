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
	$get_num = $_GET['num'];
	$sql = "SELECT * FROM msgdata1 WHERE roomid = '{$get_room}' order by id desc LIMIT $get_num";
	$result = $conn->query($sql);
	if ($result->num_rows > 0) {
		$Arr = array();
		while($row = $result->fetch_assoc()) {
			$arr = array ('msg'=>$row["msg"],'username'=>$row["username"]);
			Array_push($Arr, $arr);
		}
		echo json_encode($Arr);
	}
 ?>