'use strict';

angular
  .module('isa.account', [])
  .config(function($stateProvider) {
    $stateProvider.state('accounts', {
      url: '/accounts',
      parent: 'base',
      templateUrl: 'client/account/accountsView.ng.html',
      controller: 'AccountsController'
    })
    .state('account', {
      url: '/accounts/:accountId',
      parent: 'base',
      templateUrl: 'client/account/accountView.ng.html',
      controller: 'AccountController',
      resolve: {
        account: function($stateParams, ERRS, accountSub) {
          var account = BillingAccounts.findOne($stateParams.accountId);
          if (!account) {
            return $.reject(ERRS.unauthorized);
          }
          return account;
        }
      }
    });
  });
