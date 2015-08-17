'use strict';

angular
  .module('isa.account', [])
  .config(function($stateProvider) {
    $stateProvider.state('account', {
      url: '/account',
      parent: 'base',
      templateUrl: 'client/account/accountView.ng.html',
      controller: 'AccountController',
      resolve: {
        accountSub: function($meteor) {
          return $meteor.subscribe("accountSubscriptions");
        }
      },
      onExit: function(accountSub) {
        accountSub.stop();
      }
    });
  });
