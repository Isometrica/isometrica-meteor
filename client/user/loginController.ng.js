
'use strict';

angular
	.module('isa.user')
	.controller('LoginController', LoginController);

function LoginController($scope, $meteor, $state) {

	$scope.creds = {};

	var success = function() {
		$state.go('overview', {});
	};

	var failure = function(err) {
		$scope.err = err;
	};

	$scope.login = function() {
		$meteor.loginWithPassword($scope.creds.email, $scope.creds.password).then(success, failure);
	};

}
