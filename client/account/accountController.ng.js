'use strict';

angular
  .module('isa.account')
  .controller('AccountController', AccountController);

/**
 * @author Steve Fortune
 */
function AccountController($scope, $stateParams) {
  $scope.account = $scope.$meteorObject(BillingAccounts, $stateParams.accountId);
}
