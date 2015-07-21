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
		controller : ['$scope', '$state', '$meteor', function($scope, $state, $meteor) {

			//logoff the user, redirect to welcome page
			$scope.logout = function() {

				Meteor.logout(function(res) {
					$state.go('welcome');
				})
			}

			/**
			 * Current user's existing memberships
			 *
			 * @var Mongo.Collection
			 */
			$scope.memberships = $scope.$meteorCollection(Memberships, false).subscribe('myMemberships');

			/**
			 * The user's current organisation (reactive)
			 *
			 * @var Object
			 */
			$scope.currentMembership = $scope.$meteorObject(Memberships, {
				_groupId: Partitioner.group()
			});

			/**
			 * @param org	Object
			 */
			$scope.setCurrentOrganisation = function(org) {};

		}],
		scope : {
			multiLine : '@'
		}
	};
});
