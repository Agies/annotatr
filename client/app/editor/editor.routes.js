'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('shell.editor', {
    url: '^/editor',
    abstract: true,
    template: '<ui-view/>'
  });
  $stateProvider.state('shell.editor.new', {
    url: '/new',
    template: '<editor></editor>'
  });
  $stateProvider.state('shell.editor.id', {
    url: '/:screenName',
    template: '<editor></editor>'
  });
}
