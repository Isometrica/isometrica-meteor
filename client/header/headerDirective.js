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
		controller : ['$scope', '$state', function($scope, $state) {

			$scope.logout = function() {

				Meteor.logout(function(res) {
					console.log('logged out?');
					$state.go('welcome');
				})
			}

		}],
		scope : {
			multiLine : '@'
		}
	};
});
