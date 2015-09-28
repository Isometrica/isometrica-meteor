
'use strict';

angular
	.module('isa.user')
	.controller('LoginController', LoginController);

function LoginController($scope, $meteor, $state) {

  $scope.acceptance = $state.params.acceptance;
	$scope.creds = {};

	var success = function() {
		$state.goFromLogin('overview');
	};

	var failure = function(err) {
		$scope.loading = false;
		$scope.err = err;
	};

	$scope.login = function() {
		$scope.loading = true;
		$meteor.loginWithPassword($scope.creds.email, $scope.creds.password).then(success, failure);
	};

}
