
angular
  .module('isa.signup')
  .controller('SignupController', SignupController);

/**
 * @author Steve Fortune
 */
function SignupController($scope, $meteor, $state) {

  $scope.user = {};

  var success = function(orgId) {
    $meteor.loginWithPassword($scope.user.email, $scope.user.password).then(function() {
      $state.go('overview', {
        orgId: orgId
      });
    }, failure);
  };

  var failure = function(err) {
    $scope.err = err;
  };

  $scope.signup = function() {
    $meteor.call('registerUser', $scope.user).then(success, failure);
  };

};
