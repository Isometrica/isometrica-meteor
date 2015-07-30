'use strict';

angular
  .module('isa.account')
  .controller('AccountController', AccountController);

/**
 * @author Steve Fortune
 */
function AccountController($scope, account) {
  $scope.account = account;
}
