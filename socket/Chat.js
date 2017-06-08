let io = require('socket.io');
let getNum = require('../lib/getNum.js');
class Chat {
    constructor(server) {
        this.userList = [];
        this.roomList = [];
        this.io = io(server);
        this.init();
    }
    init() {
        this._connection();
    }
    _connection() {
        this.io.on('connection', (socket) => {
            let usrname1 = '';
            let userinfo = {};
            socket.on('hello', (data) => {
                userinfo.socketid = socket.id;
                userinfo.room = data.room;
                userinfo.name = data.name;
                usrname1 = data.name;
                this.userList.push(userinfo);
                //封装用户信息并保存
                // console.log(this.userList);
                socket.join(data.room);
                // 用户加入选定房间
                socket.broadcast.to(userinfo.room).emit('showhello', data.name);
                // socket.emit('showhello', '您');

            });
            socket.on('msg', (data) => {
                socket.broadcast.to(userinfo.room).emit("showmsg", data);
            })
            socket.on('getmsg', (data) => {
                console.log('需要连接的id');
                console.log(this._backloginid(data.roomid, socket.id));
                if (this._backloginid(data.roomid, socket.id)) {
                    this.io.sockets.connected[this._backloginid(data.roomid, socket.id)].emit('postmsg', data);
                } else {
                    //没有可拉取信息的用户 直接叫用户数据库读取数据
                    console.log("没有可拉取的用户 叫用户数据库提取数据");
                    this.io.sockets.connected[socket.id].emit('gobase', data);
                }
            })
            socket.on('disconnect', async(data) => {
                // 在这加东西记录用户断开 同步数据库
                let option = {
                    'username': usrname1,
                }
                let odata = await getNum(`http://localhost/chat/lossuser.php`, option);
                //用户下线后在已登录用户中去掉这个用户
                let deletei;
                this.userList.forEach((value, index) => {
                    if (value.socketid == socket.id) {
                        deletei = index;
                    }
                });
                this.userList.splice(deletei, 1);
                // console.log(this.userList);
                //结束
                socket.broadcast.to(userinfo.room).emit("outshow", userinfo.name);
            })
        });
    }
    _backloginid(roomid, id) {
        // console.log('这是所有在线人员');
        // console.log(this.userList)
        if (!this.userList.length) {
            return undefined;
        }
        let arr = [];
        this.userList.forEach((value) => {
            if (value.room == roomid && value.socketid != id) {
                arr.push(value);
            }
        });
        if (!arr.length) {
            return undefined;
        }
        let radomnum = Math.floor(Math.random() * arr.length);
        // console.log('这是在同一房间的在线人员');
        // console.log(arr);
        // console.log('这是随机出来的数字');
        // console.log(radomnum);
        // console.log('这是随机出来的信息');
        // console.log(arr[radomnum]);
        return arr[radomnum].socketid;
    };
}
module.exports = Chat;