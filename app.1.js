const config = require('./config/main.js')
const indexR = require('./contoller/index');
const serve = require('koa-static');
const render = require('koa-ejs');
const json = require('koa-json')
const koa = require('koa');
const app = new koa();
const server = require('http').createServer(app.callback());
app.use(json());
render(app, {
    root: config.viewsPath,
    layout: false,
    viewExt: 'html',
    cache: false,
    debug: true
});
app.use(serve(config.publicPath));
app.use(async(ctx, next) => {
    try {
        await next();
    } catch (err) {
        err.status = err.statusCode || err.status || 500;
        throw err;
    }
});
app.use(indexR.routes());
app.use(async(ctx, next) => {
    await next();
    ctx.status = 404;
    ctx.body = '404 页面没找到'
})

app.use(indexR.allowedMethods());
const io = require('socket.io')(server);
io.on('connection', function(socket) {
    socket.join('one');
    socket.on('hello', function(data) {
        socket.broadcast.emit("showhello", data);
        socket.emit('showhello', '您');
    });
    socket.on('msg', function(data) {
        socket.broadcast.emit("showmsg", data);
    })
});
server.listen(config.port);
console.log('聊天室服务已经启动 端口3000');