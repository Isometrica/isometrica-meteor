
angular
  .module('isa.user')
  .controller('SignupController', SignupController);

/**
 * @author Steve Fortune
 */
function SignupController($scope, $meteor, $state) {

  $scope.user = {};

  var success = function(orgId) {
    $meteor.loginWithPassword($scope.user.email, $scope.user.password).then(function() {
      $state.go('overview');
    }, failure);
  };

  var failure = function(err) {
    $scope.loading = false;
    $scope.err = err;
  };

  $scope.signup = function() {
    $scope.loading = true;
    $meteor.call('registerUser', $scope.user).then(success, failure);
  };

};
