'use strict';

angular
  .module('isa.account')
  .controller('AccountController', AccountController);

/**
 * @author Steve Fortune
 */
function AccountController($scope, $stateParams, account) {

  $scope.account = account;
  $scope.mutAccount = angular.copy(account);

  var accounts = $scope.$meteorCollection(BillingAccounts, false);

  var complete = function() {
    $scope.loading = false;
  };

  $scope.save = function() {
    $scope.loading = true;
    accounts.save($scope.mutAccount).then(complete);
  };

}
