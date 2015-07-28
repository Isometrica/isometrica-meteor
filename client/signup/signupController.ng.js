
angular
  .module('isa.signup')
  .controller('SignupController', SignupController);

/**
 * @author Steve Fortune
 */
function SignupController($scope) {
  $scope.user = {};
  $scope.fieldConf = {
    labelClass: "col-sm-8 col-md-offset-2",
    inputClass: "col-sm-8 col-md-offset-2"
  };
};
