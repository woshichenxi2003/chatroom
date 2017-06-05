let io = require('socket.io');
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
            let userinfo = {};
            socket.on('hello', (data) => {
                userinfo.socket = socket;
                userinfo.room = data.room;
                userinfo.name = data.name;
                this.userList.push(userinfo);
                //封装用户信息并保存
                socket.join(data.room);
                // 用户加入选定房间
                socket.broadcast.to(userinfo.room).emit('showhello', data.name);
                // socket.emit('showhello', '您');

            });
            socket.on('msg', (data) => {
                socket.broadcast.to(userinfo.room).emit("showmsg", data);
            })
            socket.on('disconnect', (data) => {
                socket.broadcast.to(userinfo.room).emit("outshow", userinfo.name);
            })
        });
    }
}
module.exports = Chat;