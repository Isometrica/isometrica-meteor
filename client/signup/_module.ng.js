
angular
  .module('isa.signup', [])
  .config(function($stateProvider) {
    $stateProvider
    .state('signup', {
      url: '/signup',
      parent: 'base',
      templateUrl: 'client/signup/signupView.ng.html',
      controller: 'SignupController'
    });
  });
