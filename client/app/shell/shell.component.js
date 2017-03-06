import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './shell.routes';
export class ShellController {

  /*@ngInject*/
  constructor(socket) {
    this.socket = socket;
  }

  $onInit() {
  }
}

export default angular.module('annotatrApp.shell', [uiRouter])
  .config(routing)
  .component('shell', {
    template: require('./shell.html'),
    controller: ShellController
  })
  .name;
