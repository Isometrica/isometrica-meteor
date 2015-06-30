'use strict';

var app = angular.module('isa');

app.directive('isaHeader', function() {
	return {
		replace : true,
		restrict : 'E',
		templateUrl: function(elem,attrs) {
			return 'client/header/' + (attrs.multiLine === 'true' ? 'headerMulti.ng.html' : 'header.ng.html');
		},
		transclude : true,
		//TODO controller : ['$scope', '$state', 'Identity', function($scope, $state, Identity) {
		controller : ['$scope', '$state', function($scope, $state) {
			$scope.logout = function() {
				//TODO Identity.logout();
			 	$state.go('welcome');
			};
		}],
		scope : {
			multiLine : '@'
		}
	};
});
