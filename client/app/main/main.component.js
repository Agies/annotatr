import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';
export class MainController {

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  $onInit() {
    this.$http.get('/api/things')
      .then(response => {
      });
  }
}

export default angular.module('annotatrApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
