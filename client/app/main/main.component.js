import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';
const screen = 'screen';

export class MainController {
  screens = null;
  card = true;
  list = false;
  /*@ngInject*/
  constructor($http, $scope, Modal) {
    this.$http = $http;
    this.modal = Modal;
    $scope.$on(screen, (event, data) => {
      this.screens = data;
    });
  }

  changeView(view) {
    if (view == 'card') {
      this.card = true;
      this.list = false;
    } else {
      this.card = false;
      this.list = true;
    }
    window.localStorage.setItem('view', view);
  }

  $onInit() {
    this.changeView(window.localStorage.getItem('view') || 'card');
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
