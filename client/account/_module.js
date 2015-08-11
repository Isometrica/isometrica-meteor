'use strict';

angular
  .module('isa.account', [])
  .config(function($stateProvider) {
    $stateProvider.state('account', {
      url: '/accounts/:accountId',
      parent: 'base',
      templateUrl: 'client/account/accountView.ng.html',
      controller: 'AccountController',
      resolve: {
        accountSub: function($meteor) {
          return $meteor.subscribe(AccountSubscriptions);
        }
      },
      onExit: function(accountSub) {
        accountSub.stop();
      }
    });
  });
