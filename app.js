const config = require('./config')
const indexR = require('./contoller/index');
const serve = require('koa-static');
const render = require('koa-ejs');
const json = require('koa-json')
const koa = require('koa');
const Chat = require('./socket/Chat');
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
// let chat = new Chat(server);
module.exports = server;