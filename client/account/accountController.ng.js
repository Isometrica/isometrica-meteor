'use strict';

angular
  .module('isa.account')
  .controller('AccountController', AccountController);

/**
 * @author Steve Fortune
 */
function AccountController($scope, $stateParams) {

  $scope.account = $scope.$meteorObject(AccountSubscriptions, false);

  var complete = function() {
    $scope.loading = false;
  };

  $scope.save = function() {
    $scope.loading = true;
    $scope.account.save().then(complete);
  };

}
