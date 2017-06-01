const router = require('koa-router')();
router.get('/chat', async(ctx, next) => {
    // io.on('connection', function() { console.log('有人连接') });
    await ctx.render('index');
});
module.exports = router