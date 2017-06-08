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
                            let myid = response.data.id;
                            let otherid = response.data.loginid;
                            console.log(myid, otherid);
                            //给此用户注册peer对象
                            this.peer = new Peer(myid, {
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
                                console.log(id);
                            });
                            this.peer.on('connection', (c) => {
                                console.log('显示连接的id' + c.peer);
                                c.on('data', (data) => {
                                    console.log(data);
                                    let arr = [];
                                    data.forEach((element) => {
                                        if (element.username == this.username) {
                                            this.oList.innerHTML = `<div class="msg-item msg-item-self">
                                                            <i class="msg-user mui-icon mui-icon-person">
                                                                <div class="namename">${element.username}</div>
                                                            </i>
                                                            <div class="msg-content">
                                                                <div class="msg-content-inner">
                                                                    ${element.msg}
                                                                </div>
                                                                <div class="msg-content-arrow"></div>
                                                            </div>
                                                            <div class="mui-item-clear"></div>
                                                        </div>` + this.oList.innerHTML;

                                        } else {
                                            this.oList.innerHTML = `<div class="msg-item">
                                                     <i class="msg-user mui-icon mui-icon-person">
                                                         <div class="namename">${element.username}</div>
                                                     </i>
                                                    <div class="msg-content">
                                                        <div class="msg-content-inner">
                                                            ${element.msg}
                                                        </div>
                                                        <div class="msg-content-arrow"></div>
                                                    </div>
                                                    <div class="mui-item-clear"></div>
                                                </div>` + this.oList.innerHTML;
                                        }
                                        arr.push(element);
                                    });
                                    this.msg[roomid] = arr;
                                });

                                c.on('close', function() {
                                    console.log(c.peer + ' 已断开.');
                                });


                            });
                            this.peer.on('error', function(err) {
                                console.log(err);
                                this._getmsgbyapi();
                            });
                            //连接其他用户发出调用
                            if (otherid) {
                                socket.emit('getmsg', { loginid: otherid, roomid: w.index });
                            } else {
                                //数据库调用数据并显示在页面上
                                this._getmsgbyapi();
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
                    //监听结束
                    // //接收专递过来的信息 并显示到用户界面
                    // socket.on('getmsg', (data) => {
                    //     let conn = peer.connect(data.loginid, {
                    //         label: 'chat',
                    //     });
                    //     conn.on('open', () => {
                    //         conn.send(this.msg[this.userroom]);
                    //     });

                    //     conn.on('error', function(err) {
                    //         console.log(err);
                    //     });
                    // });
                    // //监听结束
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
    _addmsgToViews(myid, loginid, list, roomid, num, oname, cb) {
        //先看有没有登录的用户 如果有从用户处拉取数据 没有数据再从服务器调取数据

        this._getmsgforpeer(myid, loginid, () => {
            axios.get('/getmsg', {
                params: {
                    'roomid': roomid,
                    'num': num
                }
            }).then((response) => {
                console.log(response.data)
                console.log(oname)
                var arr = [];
                response.data.forEach((element) => {
                    if (element.username == oname) {
                        list.innerHTML = `<div class="msg-item msg-item-self">
                                                            <i class="msg-user mui-icon mui-icon-person">
                                                                <div class="namename">${element.username}</div>
                                                            </i>
                                                            <div class="msg-content">
                                                                <div class="msg-content-inner">
                                                                    ${element.msg}
                                                                </div>
                                                                <div class="msg-content-arrow"></div>
                                                            </div>
                                                            <div class="mui-item-clear"></div>
                                                        </div>` + list.innerHTML;

                    } else {
                        list.innerHTML = `<div class="msg-item">
                                                     <i class="msg-user mui-icon mui-icon-person">
                                                         <div class="namename">${element.username}</div>
                                                     </i>
                                                    <div class="msg-content">
                                                        <div class="msg-content-inner">
                                                            ${element.msg}
                                                        </div>
                                                        <div class="msg-content-arrow"></div>
                                                    </div>
                                                    <div class="mui-item-clear"></div>
                                                </div>` + list.innerHTML;
                    }
                    arr.push(element);
                }, this);
                this.msg[roomid] = arr;
                // console.log(this.msg);
                cb();
            }).catch(function(err) {
                console.log(err);
            });
        }, roomid);
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
    _getmsgforpeer(myid, loginid, cb, roomid, username) {
        let connectedPeers = {};
        let peer = new Peer(myid, {
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
        peer.on('open', function(id) {
            console.log(id);
        });
        peer.on('connection', (c) => {
            console.log('显示连接的id' + c.peer);
            //反向连接
            if (!connectedPeers[c.peer]) {
                let coon = peer.connect(c.peer, {
                    label: 'chat',
                });
                coon.on('open', () => {
                    connectedPeers[coon.peer] = coon;
                    //console.log(this.msg[roomid]);
                    coon.send(this.msg[roomid]);

                });
                coon.on('error', function(err) {
                    console.log(err);
                });
                //反向连接结束
                c.on('data', (data) => {
                    console.log(data);
                    let arr = [];
                    data.forEach((element) => {
                        if (element.username == this.username) {
                            this.oList.innerHTML = `<div class="msg-item msg-item-self">
                                                            <i class="msg-user mui-icon mui-icon-person">
                                                                <div class="namename">${element.username}</div>
                                                            </i>
                                                            <div class="msg-content">
                                                                <div class="msg-content-inner">
                                                                    ${element.msg}
                                                                </div>
                                                                <div class="msg-content-arrow"></div>
                                                            </div>
                                                            <div class="mui-item-clear"></div>
                                                        </div>` + this.oList.innerHTML;

                        } else {
                            this.oList.innerHTML = `<div class="msg-item">
                                                     <i class="msg-user mui-icon mui-icon-person">
                                                         <div class="namename">${element.username}</div>
                                                     </i>
                                                    <div class="msg-content">
                                                        <div class="msg-content-inner">
                                                            ${element.msg}
                                                        </div>
                                                        <div class="msg-content-arrow"></div>
                                                    </div>
                                                    <div class="mui-item-clear"></div>
                                                </div>` + this.oList.innerHTML;
                        }
                        arr.push(element);
                    });
                    this.msg[roomid] = arr;
                });

            }
            c.on('close', function() {
                console.log(c.peer + ' 已断开.');
            });


        });
        peer.on('error', function(err) {
            console.log(err);
            cb();
        });
        if (!loginid) {
            return cb()
        };
        //建立初始连接
        let conn = peer.connect(loginid, {
            label: 'chat',
        });
        conn.on('open', function() {
            connectedPeers[conn] = conn;
            // conn.send(this.msg);
        });

        conn.on('error', function(err) {
            console.log(err);
        });

    };
    _getmsgbyapi() {
        axios.get('/getmsg', {
            params: {
                'roomid': roomid,
                'num': num
            }
        }).then((response) => {
            console.log(response.data)
            console.log(oname)
            var arr = [];
            response.data.forEach((element) => {
                if (element.username == oname) {
                    list.innerHTML = `<div class="msg-item msg-item-self">
                                                            <i class="msg-user mui-icon mui-icon-person">
                                                                <div class="namename">${element.username}</div>
                                                            </i>
                                                            <div class="msg-content">
                                                                <div class="msg-content-inner">
                                                                    ${element.msg}
                                                                </div>
                                                                <div class="msg-content-arrow"></div>
                                                            </div>
                                                            <div class="mui-item-clear"></div>
                                                        </div>` + list.innerHTML;

                } else {
                    list.innerHTML = `<div class="msg-item">
                                                     <i class="msg-user mui-icon mui-icon-person">
                                                         <div class="namename">${element.username}</div>
                                                     </i>
                                                    <div class="msg-content">
                                                        <div class="msg-content-inner">
                                                            ${element.msg}
                                                        </div>
                                                        <div class="msg-content-arrow"></div>
                                                    </div>
                                                    <div class="mui-item-clear"></div>
                                                </div>` + list.innerHTML;
                }
                arr.push(element);
            }, this);
            this.msg[roomid] = arr;
            // console.log(this.msg);
            cb();
        }).catch(function(err) {
            console.log(err);
        });
    }

}