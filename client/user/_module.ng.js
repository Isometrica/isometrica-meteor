
angular
  .module('isa.user', [])
  .config(function($stateProvider) {
    $stateProvider
      .state('enroll', {
        url: '/enroll/:token',
        parent: 'base',
        data: {
          anonymous: true
        },
        templateUrl: 'client/user/enroll.ng.html',
        controller: 'EnrollController'
      })
      .state('accept', {
        url: '/accept/:membershipId',
        parent: 'base',
        templateUrl: 'client/user/accept.ng.html',
        controller: 'AcceptController',
        params:  {
          membershipId: {
            value: null,
            squash: true
          }
        },
        resolve: {
          memSub: function($meteor) {
            return $meteor.subscribe('inactiveMemberships');
          },
          membership: function($stateParams, $state, $rootScope, $q, memSub, ERRS) {
            /// @todo Duplicate code - we use the same method in the organisation
            /// base route. Refactor this into a service.
            var memId = $stateParams.membershipId;
            var mem = Memberships.findOne(memId || {});
            if (!mem) {
              return $q.reject(ERRS.unauthorized);
            } else if (!memId) {
              $state.goNext({ membershipId: mem._id }, { reload: false });
            }
            return mem;
          }
        },
        onExit: function($rootScope, memSub) {
          memSub.stop();
        }
      })
      .state('signup', {
        url: '/signup',
        parent: 'base',
        templateUrl: 'client/user/signupView.ng.html',
        controller: 'SignupController',
        data: {
          anonymous: true
        }
      })
      .state('login', {
        url: '/login',
        parent: 'base',
        templateUrl: 'client/user/login.ng.html',
        controller: 'LoginController',
        data: {
          anonymous: true
        }
      });
  });
