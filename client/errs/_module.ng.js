
angular.module('isa.errs', [])
  .constant('ERRS', {
    unauthorized: 403
  })
  .run(function($rootScope, $state, ERRS) {
      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        if (error === ERRS.unauthorized) {
          $state.go('overview');
          event.preventDefault();
        }
      });
  });
