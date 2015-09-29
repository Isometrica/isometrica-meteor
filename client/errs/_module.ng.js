
angular.module('isa.errs', [])
  .constant('ERRS', {
    unauthorized: 403
  })
  .run(function($rootScope, $state, ERRS) {
      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {

        switch (error) {
          case ERRS.unauthorized:
            $state.go('overview');
            event.preventDefault();
            break;
          case 'AUTH_REQUIRED':
            $state.setBeforeLogin(toState, toParams);
            $state.go('login');
            event.preventDefault();
            break;
        }

      });
  });
