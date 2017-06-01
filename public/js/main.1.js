let btnArray = ['确定'];
const oList = document.querySelector('#msg-list');
const oBtn = document.querySelector('#msg-type');
const oIpnt = document.querySelector('#msg-text');
oIpnt.addEventListener('focus', () => {
    oIpnt.value = '';
})
mui.prompt('请输入您的姓名：', '', '聊天室', btnArray, function(e) {
    if (e.index == 0) {
        var socket = io();
        socket.on('connect', function() {
            socket.emit('hello', e.value);
        });
        socket.on('showhello', function(data) {
            oList.innerHTML = oList.innerHTML + `<div class="msg-item msg-item-center">
                                                    <div class="msg-content">
                                                        <div class="msg-content-inner">
                                                            ${data}已经登录了
                                                        </div>
                                                    </div>
                                                    <div class="mui-item-clear"></div>
                                                </div>`;
        });
        socket.on('showmsg', function(data) {
            oList.innerHTML = oList.innerHTML + `<div class="msg-item">
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

        oBtn.addEventListener('click', (e) => {
            if (!oIpnt.value) return alert("亲 您什么都没写");
            oList.innerHTML = oList.innerHTML + `<div class="msg-item msg-item-self">
                                                    <i class="msg-user mui-icon mui-icon-person"></i>
                                                    <div class="msg-content">
                                                        <div class="msg-content-inner">
                                                            ${oIpnt.value}
                                                        </div>
                                                        <div class="msg-content-arrow"></div>
                                                    </div>
                                                    <div class="mui-item-clear"></div>
                                                </div>`;
            socket.emit('msg', oIpnt.value);
            oIpnt.value = '';
        });

    }
});