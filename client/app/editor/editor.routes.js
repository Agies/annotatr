'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('editor', {
    url: '/editor',
    template: '<editor></editor>'
  });
}
