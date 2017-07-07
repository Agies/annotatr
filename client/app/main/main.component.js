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

  collectScreens(count, collector, modal) {
    var loadMore = false;
    this.$http.get('/api/screen?page=' + count)
      .then(response => {
        collector = collector.concat(response.data.result);
        loadMore = collector.length != response.data.count;
      })
      .then(null, error => {
        console.error(error);
      })
      .then(() => {
        if (loadMore) {
          this.collectScreens(count + 1, collector, modal);
        }
        this.screens = collector;
        modal.close();
      });
  }

  $onInit() {
    this.changeView(window.localStorage.getItem('view') || 'card');
    var modal = this.modal.alert.spinner();
    this.collectScreens(0, [], modal);
  }
}

export default angular.module('annotatrApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
