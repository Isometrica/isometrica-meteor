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

			//logoff the user, redirect to welcome page
			$scope.logout = function() {

				Meteor.logout(function(res) {
					$state.go('welcome');
				})
			}

		}],
		scope : {
			multiLine : '@'
		}
	};
});
