import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './editor.routes';
const templateName = 'annotationTemplate';
export class EditorController {
  currentNumber = 1;
  image = null;
  imageHover = false;
  definitions = [];
  showSpinner = false;

  hasImage() {
    return !this.image;
  }

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  $onInit() {
    this.$http.get('/api/things')
      .then(response => {
      });
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
      this.definitions.push(obj);
    }
    obj.left = `${event.clientX + parseInt(offset[0], 10)}px`;
    obj.top = `${event.clientY + parseInt(offset[1], 10)}px`;
  }

  loadImage(file) {
    var that = this;
    var reader = new FileReader();
    reader.onload = event => {
      that.image = event.target.result;
      this.showSpinner = false;
    };
    reader.readAsDataURL(file);
    this.showSpinner = true;
  }
}

export default angular.module('annotatrApp.editor', [uiRouter])
  .config(routing)
  .component('editor', {
    template: require('./editor.html'),
    controller: EditorController
  })
  .name;
