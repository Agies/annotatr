'use strict';
var count = 0;
var service = {
  socketServer: null,
  broadcast(event, data) {
    this.socketServer.emit(event, data);
  },
  setup(io) {
    this.socketServer = io;
    io.on('connection', socket => {
      console.log('connection opened');
      count++;
      io.emit('client:connected', { count });
      socket.on('screen:update', data => {
        console.log(data);
        socket.broadcast.emit('screen:update', data);
      });
      socket.on('disconnect', () => {
        console.log('connection closed');
        count--;
        io.emit('client:disconnected', { count });
      });
    });
  }
};

module.exports = service;
