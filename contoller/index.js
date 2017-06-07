const router = require('koa-router')();
const con = require('../model/apiCon.js');
let idStr = 0;
router.get('/chat', async(ctx, next) => {
    await ctx.render('index');
});
router.get('/peer', async(ctx, next) => {

    await ctx.render('peer', { id: idStr });
    idStr = idStr + 1;
});
router.get('/peer1', async(ctx, next) => {

    await ctx.render('peertest');

});
router.get('/getuser', con.getuser());
router.get('/adduser', con.adduser());
router.get('/addmsg', con.addmsg());
router.get('/getmsg', con.getmsg());
module.exports = router