
'use strict';

angular
  .module('isa.account', [])
  .config(function($stateProvider) {
    $stateProvider.state('account', {
      url: '/account',
      parent: 'base',
      templateUrl: 'client/account/accounts.ng.html',
      controller: 'AccountsController',
      resolve: {
        accountSub: function($meteor) {
          return $meteor.subscribe("accounts");
        }
      },
      onExit: function(accountSub) {
        accountSub.stop();
      }
    })
    .state('account.manage', {
      url: '/account/:accountId',
      parent: 'base',
      templateUrl: 'client/account/account.ng.html',
      controller: 'AccountsController',
      resolve: {}
    });
  });
