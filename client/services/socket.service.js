'use strict';
const angular = require('angular');
const screenUpdate = 'screen:update';
const screen = 'screen';

/*@ngInject*/
export function socketService($rootScope, $timeout) {
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
    $timeout(() => {
      $rootScope.$broadcast(data.name, data);
    }, 1);
  });
  socket.on(screen, data => {
    $timeout(() => {
      $rootScope.$broadcast(screen, data);
    }, 1);
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
