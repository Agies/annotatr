'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('editor', {
    url: '/editor',
    abstract: true,
    template: '<ui-view/>'
  });
  $stateProvider.state('editor.new', {
    url: '/new',
    template: '<editor></editor>'
  });
  $stateProvider.state('editor.id', {
    url: '/:screenName',
    template: '<editor></editor>'
  });
}
