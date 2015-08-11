'use strict';

angular
	.module('isa')
	.directive('isaHeader', isaHeaderDirective);

function isaHeaderDirective() {
	return {
		replace : true,
		restrict : 'E',
		templateUrl: 'client/header/header.ng.html',
		transclude : true,
		controller: function($scope, $state) {
			$scope.logout = function() {
				Meteor.logout(function(res) {
					$state.go('welcome');
				})
			}
		}
	};
}
