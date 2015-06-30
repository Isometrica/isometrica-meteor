
var app = angular.module('isa');

app.controller( 'LoginController', [
	'$scope', '$rootScope', '$location', '$state',
	function($scope, $rootScope, $location, $state, Identity) {

	$scope.hasError = false;
	$scope.errorMsg = "";
	$scope.rememberMe = false;

	$scope.login = function() {

		//TODO
		/*Identity.login($scope.email, $scope.password, $scope.rememberMe).then(function() {
			$state.go('overview');
		}, function(res) {
			$scope.hasError = true;
	        $scope.errorMsg = res.data.error.message;
		});*/
	};

}]);
