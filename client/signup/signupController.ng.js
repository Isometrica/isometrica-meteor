
angular
  .module('isa.signup')
  .controller('SignupController', SignupController);

/**
 * @author Steve Fortune
 */
function SignupController($scope, $meteor) {

  $scope.user = {};

  var success = function() {
    console.log('Success !');
  };

  var failure = function() {
    console.log('Failure');
    console.log(arguments);
  };

  $scope.signup = function() {
    $meteor.call('registerUser', $scope.user).then(success, failure);
  };

};
