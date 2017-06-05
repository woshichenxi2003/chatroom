class Chat {
    constructor() {
        this.btnArray = ['确定'];
        this.rooms = ['房间一', '房间二', '房间三']
        this.username = '';
        this.userroom = '';
        this.oList = document.querySelector('#msg-list');
        this.oBtn = document.querySelector('#msg-type');
        this.oIpnt = document.querySelector('#msg-text');
        this.init();
    };
    init() {
        this.oIpnt.addEventListener('focus', () => {
            this.oIpnt.value = '';
        })
        mui.prompt('请输入您的姓名：', '', '聊天室', this.btnArray, (e) => {
            if (e.index == 0) {
                this.username = e.value;
                mui.confirm('请选择房间', '提示', this.rooms, (w) => {
                    this.userroom = w.value;
                    var socket = io();
                    //预先加载五条房间内的信息
                    console.log(e.value)
                        //预加载结束
                    socket.on('connect', () => {
                        socket.emit('hello', { name: e.value, room: w.index });
                        //存储数据 adduser
                        axios.get('/adduser', {
                            params: {
                                username: e.value,
                                roomid: w.index
                            }
                        }).then((response) => {
                            this._addmsgToViews(this.oList, w.index, 5, e.value, () => {
                                this.oList.innerHTML = this.oList.innerHTML + this._creatSting('您', e.value, 'hello');
                            });
                            console.log(response.data);
                        }).catch((response) => {
                            console.log(response.data);
                        });
                        //存储数据结束
                    });
                    socket.on('showhello', (data) => {
                        this.oList.innerHTML = this.oList.innerHTML + this._creatSting(data, e.value, 'hello');
                    });
                    socket.on('showmsg', (data) => {
                        this.oList.innerHTML = this.oList.innerHTML + this._creatSting(data.msg, data.name, 'other');

                    });
                    socket.on('outshow', (data) => {
                        this.oList.innerHTML = this.oList.innerHTML + this._creatSting(data, undefined, 'out');
                    });

                    this.oBtn.addEventListener('click', () => {
                        var oInputValue = this.oIpnt.value;
                        if (!this.oIpnt.value) return alert("亲 您什么都没写");
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
                    });

                })

            }
        });
    }
    _addmsgToViews(list, roomid, num, oname, cb) {
        axios.get('/getmsg', {
            params: {
                'roomid': roomid,
                'num': num
            }
        }).then(function(response) {
            console.log(response.data)
            console.log(oname)
            response.data.forEach(function(element) {
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

            }, this);
            cb();
        }).catch(function(response) {
            console.log(response);
        });

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
}