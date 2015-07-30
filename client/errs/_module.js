
angular.module('isa.errs', [])
  .constant('ERRS', {
    unauthorized: 403
  })
  .run(function($rootScope, $state, ERRS) {
      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        if (err === ERRS.unauthorized) {
          $state.go('unauthorized');
        }
      });
  })
  .config(function($stateProvider) {
    $stateProvider
      .state('unauthorized', {
        url: '/403',
        parent: 'base',
        templateUrl: 'client/errs/403.ng.html',
        data: {
          anonymous: true
        }
      });
  });
