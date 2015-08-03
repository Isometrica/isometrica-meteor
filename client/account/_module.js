'use strict';

angular
  .module('isa.account', [])
  .config(function($stateProvider) {
    $stateProvider.state('accounts', {
      url: '/accounts',
      parent: 'base',
      templateUrl: 'client/account/accountsView.ng.html',
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
    .state('account', {
      url: '/:accountId',
      parent: 'accounts',
      templateUrl: 'client/account/accountView.ng.html',
      controller: 'AccountsViewController',
      resolve: {
        account: function($stateParams, ERRS) {
          var account = BillingAccounts.findOne($stateParams.accountId);
          if (!account) {
            return $.reject(ERRS.unauthorized);
          }
          return account;
        }
      }
    });
  });
