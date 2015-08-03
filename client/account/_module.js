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
      url: '/:accountId',
      parent: 'accounts',
      templateUrl: 'client/account/accountView.ng.html',
      controller: 'AccountViewController',
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
