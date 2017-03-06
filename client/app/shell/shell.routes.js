'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('shell', {
    abstract: true,
    template: '<shell></shell>'
  });
}
