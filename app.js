'use strict';

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

io.sockets.on('connection', function (socket) {
  socket.join('game');

  var players = io.sockets.clients('game').map(function(client){
    return client.id;
  });

  io.sockets.in('game').emit('new_player', {
    id: socket.id,
    players: players
  });

  socket.on('tile_flip', function (data) {
    console.log('tile_flip', data);

    io.sockets.in('game').emit('need_img', { id: data.id });
  });

  socket.on('upload_img', function(data){
    console.log(data);
    io.sockets.in('game').emit('send_img', { id: data.id, img: data.img });
  });
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
