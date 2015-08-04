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
}
