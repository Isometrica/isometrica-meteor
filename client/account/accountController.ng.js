'use strict';

angular
  .module('isa.account')
  .controller('AccountController', AccountController);

/**
 * @author Steve Fortune
 */
function AccountController($scope, $stateParams) {
  $scope.account = BillingAccounts.findOne($stateParams.accountId);//$scope.$meteorObject(BillingAccounts, $stateParams.accountId);
}
