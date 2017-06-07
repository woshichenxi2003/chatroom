var PeerServer = require('peer').PeerServer;
var server = PeerServer({ port: 9000, path: '/myapp' });
server.on('connection', function(id) {
    console.log(id + '登录了');
});
server.on('disconnect', function(id) {
    console.log(id + '断开了');
});