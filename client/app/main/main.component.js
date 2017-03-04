import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';
export class MainController {
  screens = null;

  /*@ngInject*/
  constructor($http, Modal) {
    this.$http = $http;
    this.modal = Modal;
  }

  $onInit() {
    var modal = this.modal.alert.spinner();
    this.$http.get('/api/screen')
      .then(response => {
        this.screens = response.data;
      })
      .then(null, error => {
        console.error(error);
      })
      .then(() => {
        modal.close();
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
