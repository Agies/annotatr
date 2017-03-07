import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './editor.routes';
const templateName = 'annotationTemplate';
const thumbnailWidth = 135;
const thumbnailHeight = 240;
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
  constructor($http, $scope, $timeout, $state, Modal, socket) {
    this.$http = $http;
    this.$state = $state;
    this.$timeout = $timeout;
    this.modal = Modal;
    this.io = socket;
    this.$scope = $scope;
  }

  $onInit() {
    if (this.$state.params.screenName) {
      var modal = this.modal.alert.spinner();
      this.$http.get(`/api/screen/${this.$state.params.screenName}`)
        .then(response => {
          if (!response.data) {
            console.error(`Sorry I cannot find ${this.$state.params.screenName}`);
            modal.close();
            this.$state.go('shell.main');
            return;
          }
          this.model = response.data;
          this.currentNumber = (this.model.definitions || []).length + 1;
          // this.$scope.$on(this.model.name, (event, data) => {
          //   data.definitions.forEach(def => {
          //     if (def.event == 'insert') {
          //       this.model.definitions.push(def);
          //     } else if (def.event == 'update') {
          //       var toUpdate = this.model.definitions[def.number - 1];
          //       if (toUpdate) {
          //         toUpdate.name = def.name;
          //         toUpdate.type = def.type;
          //         toUpdate.top = def.top;
          //         toUpdate.left = def.left;
          //         toUpdate.description = def.description;
          //       }
          //     } else if (def.event == 'delete') {
          //       this.deleteDefinition(def);
          //     } else {
          //       console.log(`I did not understand event "${def.event}".`);
          //     }
          //   });
          // });
          modal.close();
        })
        .then(null, error => {
          console.error(error);
          modal.close();
        });
    }
  }

  drop(event, dropZone, dragElement, data) {
    var defEvent = 'update';
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
      this.$timeout(() => {
        document.getElementsByClassName('annotation')[obj.number].focus();
      }, 1);
      defEvent = 'insert';
    }
    var x = event.clientX + parseInt(offset[0], 10);
    if (x < 0) {
      x = 0;
    }
    if (x > 450) {
      x = 450;
    }
    var y = event.clientY + parseInt(offset[1], 10);
    if (y < 0) {
      y = 0;
    }
    if (y > 800) {
      y = 800;
    }
    obj.left = `${x}px`;
    obj.top = `${y}px`;
    this.beginUpdate()
      .record(obj, defEvent)
      .sendUpdate();
  }

  beginUpdate() {
    return new UpdateTracker(this.model.name, this.io);
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

  update(done) {
    var modal = this.modal.alert.spinner();
    this.$http.post('/api/screen/', this.model)
      .then(response => {
        done(response);
        modal.close();
      })
      .then(null, error => {
        console.error(error);
        modal.close();
      });
  }

  save() {
    this.resizeImage(img => {
      this.model.thumbnail = img;
      this.update(response => {
        this.model = response.data;
        this.$state.go('shell.editor.id', {screenName: this.model.name});
      });
    });
  }

  resizeImage(done) {
    var img = new Image();
    img.onload = () => {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      canvas.width = thumbnailWidth;
      canvas.height = thumbnailHeight;
      ctx.drawImage(img, 0, 0, thumbnailWidth, thumbnailHeight);
      done(canvas.toDataURL());
    };
    img.src = this.model.image;
  }

  delete() {
    this.model.deleted = true;
    this.update(() => {
      this.$state.go('shell.main');
    });
  }

  select(def, scrollIn) {
    def.selected = true;
    var x = parseInt(def.left.slice(0, -2), 10);
    if (x < 0) {
      def.left = '0px';
    }
    if (x > 450) {
      def.left = '450px';
    }
    var y = parseInt(def.top.slice(0, -2), 10);
    if (y < 0) {
      def.top = '0px';
    }
    if (y > 800) {
      def.top = '800px';
    }
    if (scrollIn) {
      document.getElementsByClassName('definition')[def.number - 1].scrollIntoView();
    }
  }

  unselect(def) {
    def.selected = false;
  }

  keypressed($event, def) {
    if ($event.key == 'Delete' || $event.key == 'Backspace') {
      this.deleteDefinition(def);
    }
  }

  deleteDefinition(def) {
    var tracker = this.beginUpdate();
    tracker.record(def, 'delete');
    var index = this.model.definitions.indexOf(def);
    if (index > -1) {
      this.model.definitions.splice(index, 1);
    }
    this.model.definitions.forEach((ele, i) => {
      var newNumber = i + 1;
      if (ele.number != newNumber) {
        ele.number = newNumber;
      }
    });
    this.currentNumber = this.model.definitions.length + 1;
    tracker.sendUpdate();
  }

  updateDefinition($event, def) {
    this.beginUpdate()
      .record(def, 'update')
      .sendUpdate();
  }
}

class UpdateTracker {

  constructor(name, io) {
    this.name = name;
    this.io = io;
    this.definitions = [];
  }

  sendUpdate() {
    // var that = this;
    // this.io.socket.emit('screen:update', {
    //   name: that.name,
    //   definitions: that.definitions
    // });
  }

  record(obj, event) {
    var def = {
      event,
      number: obj.number,
      type: obj.type,
      name: obj.name,
      description: obj.description,
      left: obj.left,
      top: obj.top
    };
    this.definitions.push(def);
    return this;
  }
}

export default angular.module('annotatrApp.editor', [uiRouter])
  .config(routing)
  .component('editor', {
    template: require('./editor.html'),
    controller: EditorController
  })
  .name;
