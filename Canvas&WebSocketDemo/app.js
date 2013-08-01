var fs = require('fs');
var http = require('http');
var io = require('socket.io');
var static = require('node-static');

var PORT = 8888;
var staticServer = new static.Server(__dirname + '/static/');

var server = http.createServer(function(req,res) {
    console.log('server is connected');
    staticServer.serve(req,res);
});

server.listen(PORT);
console.log('server is listening at:' + PORT);

var socketio = io.listen(server);
socketio.sockets.on('connection',function(socket) {
    socket.on('message',function(message) {
        socket.broadcast.emit('message',message);
    });
});
