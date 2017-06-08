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
	$get_room = $_GET['roomid'];
	$get_msg = $_GET['msg'];
	$get_time = $_GET['datatime'];
	$sql = "INSERT INTO msgdata1 (username, roomid, msg, datatime) VALUES ('{$get_username}', '{$get_room}', '{$get_msg}', '{$get_time}')";
	$result = $conn->query($sql);
	echo $get_msg.'信息添加成功';
 ?>
