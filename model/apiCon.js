let getData = require('../lib/getNum.js')
const getNumPost = require('../lib/getNumPost.js')
let con = {
    getuser: () => {
        return async(ctx, next) => {
            let option = {
                'roomid': ctx.query.roomid
            }
            let data = await getData(`http://localhost/chat/getuser.php`, option);
            // let data = await getData(`http://59.110.243.215/getuser.php`, option);
            ctx.body = data;
        }
    },
    getmsg: () => {
        return async(ctx, next) => {
            let option = {
                'roomid': ctx.query.roomid,
                'num': ctx.query.num,
            }
            let data = await getData(`http://localhost/chat/getmsg.php`, option);
            // let data = await getData(`http://59.110.243.215/getmsg.php`, option);
            ctx.body = data;
        }
    },
    adduser: () => {
        return async(ctx, next) => {
            let options = {
                'username': ctx.query.username,
                'roomid': ctx.query.roomid
            }
            let data = await getData(`http://localhost/chat/adduser.php`, options);
            // let data = await getData(`http://59.110.243.215/adduser.php`, options);
            ctx.body = data;
        }
    },
    addmsg: () => {
        return async(ctx, next) => {
            let options = {
                'username': ctx.query.username,
                'roomid': ctx.query.roomid,
                'datatime': ctx.query.datatime,
                'msg': ctx.query.msg,
            }
            let data = await getData(`http://localhost/chat/addmsg.php`, options);
            // let data = await getData(`http://59.110.243.215/addmsg.php`, options);
            ctx.body = data;
        }
    }
}
module.exports = con;