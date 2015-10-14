'use strict';

angular
  .module('isa.dashboard.risks')
  .config(function($stateProvider) {
    $stateProvider
      .state('risks', {
        parent: 'organisation',
        url: '/risks',
        templateUrl: 'client/dashboard/register/risks/view/risks.ng.html',
        controller: 'RisksController',
        data: {
          $subs: [ 'risks' ]
        }
      });
  });
