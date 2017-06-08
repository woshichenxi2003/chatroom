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
	$get_username = $_GET['username'];
	$sql = "SELECT * FROM user WHERE username = '{$get_username}'";
	$result = $conn->query($sql);
	if ($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			$sql = "update user set login = 0 where username = '{$get_username}'";
			$conn->query($sql);
		}
		echo $get_username.'已退出';
	}

 ?>
