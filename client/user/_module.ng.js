
angular
  .module('isa.user', [])
  /**
   * Not particularly eloquent. Listens for enrollment links,
   * and forwards the data to our custom enroll state.
   */
  .config(function($state) {
    Accounts.onEnrollmentLink(function (token, done) {
      $state.go('enroll', {
        token: token
      });
    });
  })
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
      .state('acceptInvite', {
        url: '/accept/:membershipId',
        parent: 'base',
        templateUrl: 'client/user/acceptInvite.ng.html',
        controller: 'AcceptInviteController',
        resolve: {
          memSub: function($meteor) {
            return $meteor.subscribe('inactiveMemberships');
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
