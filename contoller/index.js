const router = require('koa-router')();
const con = require('../model/apiCon.js');
router.get('/chat', async(ctx, next) => {
    await ctx.render('index');
});
router.get('/getuser', con.getuser());
// http://localhost:3000/getuser?roomid=0
router.get('/adduser', con.adduser());
router.get('/addmsg', con.addmsg());
router.get('/getmsg', con.getmsg());
module.exports = router