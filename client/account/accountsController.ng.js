'use strict';

angular
  .module('isa.account')
  .controller('AccountsController', AccountsController);

/**
 * @author Steve Fortune
 */
function AccountsController($scope) {
  $scope.accounts = $scope.$meteorCollection(BillingAccounts, false);
}
