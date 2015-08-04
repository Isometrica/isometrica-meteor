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
        account: function($stateParams, $q, ERRS) {
          // @note Can't use $meteor.object with schema directives yet.
          var account = BillingAccounts.findOne($stateParams.accountId);
          if (!account) {
            return $q.reject(ERRS.unauthorized);
          }
          return account;
        }
      }
    });
  });
