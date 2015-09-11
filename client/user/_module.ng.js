
angular
  .module('isa.user', [])
  .config(function($stateProvider) {
    $stateProvider
      .state('enroll', {
        url: '/enroll/:token/:membershipId',
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
        controller: 'AcceptController',
        params:  {
          membershipId: {
            value: null,
            squash: true
          }
        },
        resolve: {
          currentUser: function($meteor) {
            return $meteor.requireUser();
          }
        }
      })
      .state('dormant', {
        url: '/dormant',
        parent: 'base',
        templateUrl: 'client/user/dormant.ng.html'
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
