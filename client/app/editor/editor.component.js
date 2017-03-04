import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './editor.routes';
const templateName = 'annotationTemplate';

export class EditorController {
  currentNumber = 1;
  imageHover = false;
  showSpinner = false;
  canvas = null;
  ctx = null;
  holder = null;

  model = {
    image: null,
    name: null,
    definitions: [],
    _id: null
  }

  hasImage() {
    return !this.model.image;
  }

  /*@ngInject*/
  constructor($http, $timeout, $state, Modal) {
    this.$http = $http;
    this.$state = $state;
    this.$timeout = $timeout;
    this.modal = Modal;
  }

  $onInit() {
    if (this.$state.params.screenName) {
      var modal = this.modal.alert.spinner();
      this.$http.get(`/api/screen/${this.$state.params.screenName}`)
        .then(response => {
          if (!response.data) {
            console.error(`Sorry I cannot find ${this.$state.params.screenName}`);
            return;
          }
          this.model = response.data;
          this.currentNumber = (this.model.definitions || []).length + 1;
          modal.close();
        })
        .then(null, error => {
          console.error(error);
          modal.close();
        });
    }
  }

  drop(event, dropZone, dragElement, data) {
    var files = event.dataTransfer.files;
    if(!data && files[0]) {
      this.loadImage(files[0]);
      return;
    }
    var offset = data.split(',');
    var obj = dragElement.scope().def;
    if(dragElement[0].id == templateName) {
      obj = {
        number: this.currentNumber++
      };
      this.model.definitions.push(obj);
    }
    obj.left = `${event.clientX + parseInt(offset[0], 10)}px`;
    obj.top = `${event.clientY + parseInt(offset[1], 10)}px`;
  }

  loadImage(file) {
    this.model.name = file.name;
    var that = this;
    var reader = new FileReader();
    reader.onload = event => {
      this.$timeout(() => {
        that.model.image = event.target.result;
        this.showSpinner = false;
      }, 1);
    };
    reader.readAsDataURL(file);
    this.showSpinner = true;
  }

  save() {
    var modal = this.modal.alert.spinner();
    this.$http.post('/api/screen/', this.model)
      .then(response => {
        this.model = response.data;
        this.$state.go('editor.id', {screenName: this.model.name});
        modal.close();
      })
      .then(null, error => {
        console.error(error);
        modal.close();
      });
  }
}

export default angular.module('annotatrApp.editor', [uiRouter])
  .config(routing)
  .component('editor', {
    template: require('./editor.html'),
    controller: EditorController
  })
  .name;
