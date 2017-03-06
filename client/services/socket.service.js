'use strict';
const angular = require('angular');
const screenUpdate = 'screen:update';
const screen = 'screen';

/*@ngInject*/
export function socketService($rootScope) {
  var socket = io.connect('/');
  socket.on('connect', () => {
    console.log('socket connected');
  });
  socket.on('client:connected', data => {
    console.log(`clients connected: ${data.count}`);
  });
  socket.on('client:disconnected', data => {
    console.log(`clients connected: ${data.count}`);
  });
  socket.on('disconnect', () => {
    console.log('socket disconnected');
  });
  socket.on(screenUpdate, data => {
    console.log(data);
    $rootScope.$broadcast(data.name, data);
  });
  socket.on(screen, data => {
    $rootScope.$broadcast(screen, data);
  });
  var service = {
    events: {
      screen,
      screenUpdate,
    },
    socket
  };
  return service;
}

export default angular.module('annotatrApp.socket', [])
  .service('socket', socketService)
  .name;
