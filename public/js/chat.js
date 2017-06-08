class Chat {
    constructor() {
        this.btnArray = ['确定'];
        this.rooms = ['房间一', '房间二', '房间三']
        this.username = '';
        this.userroom = '';
        this.msg = {};
        this.oList = document.querySelector('#msg-list');
        this.oBtn = document.querySelector('#msg-type');
        this.oIpnt = document.querySelector('#msg-text');
        this.init();
    };
    init() {
        var that = this;
        this.oIpnt.addEventListener('focus', () => {
            this.oIpnt.value = '';
        })
        mui.prompt('请输入您的姓名：', '', '聊天室', this.btnArray, (e) => {
            if (e.index == 0) {
                this.username = e.value;
                mui.confirm('请选择房间', '提示', this.rooms, (w) => {
                    this.userroom = w.index;
                    console.log(this.userroom);
                    var socket = io();
                    //预加载结束
                    socket.on('connect', () => {
                        socket.emit('hello', { name: e.value, room: w.index });
                        //存储数据 adduser 记录用户登录状态
                        axios.get('/adduser', {
                            params: {
                                username: e.value,
                                roomid: w.index
                            }
                        }).then((response) => {
                            // 在这个之前从其他用户读取数据 如果读取不到数据或者没有已经登录的用户再读
                            //取数据库  数据库也得修改要记录用户的登录状态 还得再做一个接口再用户退出时数据库记录 退出的接口在CHAT.js上应用
                            //给此用户注册peer对象
                            let once = true;
                            if (once) {
                                this.peer = new Peer(socket.id, {
                                    host: 'localhost',
                                    port: 9000,
                                    path: '/myapp',
                                    debug: 1,
                                    config: {
                                        'iceServers': [{
                                            url: 'stun:stun.l.google.com:19302'
                                        }]
                                    }
                                });
                                this.peer.on('open', function(id) {
                                    // console.log(id);
                                });
                                this.peer.on('connection', (c) => {
                                    console.log('显示连接的id' + c.peer);
                                    c.on('data', (data) => {
                                        this._datatoview(data);
                                    });

                                    c.on('close', function() {
                                        console.log(c.peer + ' 已断开.');
                                    });
                                });
                                this.peer.on('error', (err) => {
                                    console.log(err);
                                    this._getmsgbyapi(this.userroom, 5);
                                });
                                //连接其他用户发出调用
                                socket.emit('getmsg', { roomid: w.index, loginid: socket.id });
                                once = false;
                            }

                        }).catch((err) => {
                            console.log(err);
                        });
                        //存储数据结束
                    });
                    socket.on('showhello', (data) => {
                        this.oList.innerHTML = this.oList.innerHTML + this._creatSting(data, e.value, 'hello');
                    });
                    socket.on('showmsg', (data) => {
                        this.msg[roomid].push(data);
                        // console.log(this.msg);
                        this.oList.innerHTML = this.oList.innerHTML + this._creatSting(data.msg, data.name, 'other');
                    });
                    socket.on('outshow', (data) => {
                        this.oList.innerHTML = this.oList.innerHTML + this._creatSting(data, undefined, 'out');
                    });
                    //监听一个给其他用户请求数据的事件 并给用户返回数据
                    socket.on('postmsg', (data) => {
                        console.log('我收到了一个请求 数据是：');
                        console.log(data);
                        let conn = this.peer.connect(data.loginid, {
                            label: 'chat',
                        });
                        conn.on('open', () => {
                            conn.send(this.msg[data.roomid]);
                        });

                        conn.on('error', function(err) {
                            console.log(err);
                        });
                    });
                    socket.on('gobase', (data) => {
                        this._getmsgbyapi(this.userroom, 5)
                    });
                    this.oBtn.addEventListener('click', () => {
                        this._showmsg(e, w, socket);
                    });
                    this.oIpnt.addEventListener('keypress', (ev) => {
                        console.log(ev.which)
                        if (ev.which == 13) {
                            this._showmsg(e, w, socket);
                            this.oIpnt.value = '';
                        }

                    }, true);

                })

            }
        });
    }
    _showmsg(e, w, socket) {
        var oInputValue = this.oIpnt.value;
        if (!this.oIpnt.value) return alert("亲 您什么都没写");
        console.log(this.userroom);
        this.msg[this.userroom].push({ msg: this.oIpnt.value, name: e.value });
        console.log(this.msg)
        this.oList.innerHTML = this.oList.innerHTML + this._creatSting(this.oIpnt.value, e.value, 'self');
        socket.emit('msg', { msg: this.oIpnt.value, name: e.value });
        this.oIpnt.value = '';
        //存储信息 addmsg
        let oDate = new Date();
        let dateStr = `${oDate.getFullYear()}-${oDate.getMonth()+1}-${oDate.getDate()} ${oDate.getHours()}:${oDate.getMinutes()}:${oDate.getSeconds()}`
        axios.get('/addmsg', {
            params: {
                'username': e.value,
                'roomid': w.index,
                'datatime': dateStr,
                'msg': oInputValue,
            }
        }).then(function(response) {
            console.log(response.data);
        }).catch(function(response) {
            console.log(response.data);
        });
        //存储信息
    }
    _creatSting(msg, username, type) {
        let Arr = ``;
        switch (type) {
            case 'hello':
                Arr = `<div class="msg-item msg-item-center">
                            <div class="msg-content">
                                <div class="msg-content-inner">
                                    ${msg}已登录
                                </div>
                            </div>
                            <div class="mui-item-clear"></div>
                        </div>`
                break;
            case 'self':
                Arr = `<div class="msg-item msg-item-self">
                            <i class="msg-user mui-icon mui-icon-person">
                                <div class="namename">${username}</div>
                            </i>
                            <div class="msg-content">
                                <div class="msg-content-inner">
                                    ${msg}
                                </div>
                                <div class="msg-content-arrow"></div>
                            </div>
                            <div class="mui-item-clear"></div>
                        </div>`
                break;
            case 'other':
                Arr = `<div class="msg-item">
                                <i class="msg-user mui-icon mui-icon-person">
                                    <div class="namename">${username}</div>
                                </i>
                                <div class="msg-content">
                                    <div class="msg-content-inner">
                                        ${msg}
                                    </div>
                                    <div class="msg-content-arrow"></div>
                                </div>
                                <div class="mui-item-clear"></div>
                        </div>`
                break;
            case 'out':
                Arr = `<div class="msg-item msg-item-center">
                            <div class="msg-content">
                                <div class="msg-content-inner">
                                    ${msg}已经退出登录
                                </div>
                            </div>
                            <div class="mui-item-clear"></div>
                        </div>`
                break;
            default:

        }
        return Arr;
    }
    _getmsgbyapi(roomid, num) {
        axios.get('/getmsg', {
            params: {
                'roomid': roomid,
                'num': num
            }
        }).then((response) => {
            this._datatoview(response.data);
        }).catch(function(err) {
            console.log(err);
        });
    }
    _datatoview(data) {
        let arr = [];
        data.forEach((element) => {
            if (element.username == this.username) {
                this.oList.innerHTML = this.oList.innerHTML + this._creatSting(element.msg, element.username, 'self')
            } else {
                this.oList.innerHTML = this.oList.innerHTML + this._creatSting(element.msg, element.username, 'other')
            }
            arr.push(element);
        });
        this.msg[this.userroom] = arr;
    }
}