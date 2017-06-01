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
                    socket.on('connect', () => {
                        socket.emit('hello', { name: e.value, room: w.index });
                    });
                    socket.on('showhello', (data) => {
                        this.oList.innerHTML = this.oList.innerHTML + `<div class="msg-item msg-item-center">
                                                    <div class="msg-content">
                                                        <div class="msg-content-inner">
                                                            ${data}已经登录了
                                                        </div>
                                                    </div>
                                                    <div class="mui-item-clear"></div>
                                                </div>`;
                    });
                    socket.on('showmsg', (data) => {
                        this.oList.innerHTML = this.oList.innerHTML + `<div class="msg-item">
                                                    <i class="msg-user mui-icon mui-icon-person"></i>
                                                    <div class="msg-content">
                                                        <div class="msg-content-inner">
                                                            ${data}
                                                        </div>
                                                        <div class="msg-content-arrow"></div>
                                                    </div>
                                                    <div class="mui-item-clear"></div>
                                                </div>`;
                    });
                    socket.on('outshow', (data) => {
                        this.oList.innerHTML = this.oList.innerHTML + `<div class="msg-item msg-item-center">
                                                    <div class="msg-content">
                                                        <div class="msg-content-inner">
                                                            ${data}已经退出登录
                                                        </div>
                                                    </div>
                                                    <div class="mui-item-clear"></div>
                                                </div>`;
                    });

                    this.oBtn.addEventListener('click', (e) => {
                        if (!this.oIpnt.value) return alert("亲 您什么都没写");
                        this.oList.innerHTML = this.oList.innerHTML + `<div class="msg-item msg-item-self">
                                                    <i class="msg-user mui-icon mui-icon-person"></i>
                                                    <div class="msg-content">
                                                        <div class="msg-content-inner">
                                                            ${this.oIpnt.value}
                                                        </div>
                                                        <div class="msg-content-arrow"></div>
                                                    </div>
                                                    <div class="mui-item-clear"></div>
                                                </div>`;
                        socket.emit('msg', this.oIpnt.value);
                        this.oIpnt.value = '';
                    });

                })

            }
        });
    }
}