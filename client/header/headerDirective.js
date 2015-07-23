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
		controller : ['$scope', '$state', '$meteor', '$rootScope', function($scope, $state, $meteor, $rootScope) {

			//logoff the user, redirect to welcome page
			$scope.logout = function() {

				Meteor.logout(function(res) {
					$state.go('welcome');
				})
			}

			if ($rootScope.currentUser) {

				/**
				 * Current organisation object
				 *
				 * @var AngularMeteorObject
				 */
				$scope.$meteorAutorun(function() {
					$scope.currentOrg = $scope.$meteorObject(Organisations, MultiTenancy.orgId());
				});

				/**
				 * Current user's existing memberships
				 *
				 * @var AngularMeteorCollection
				 */
				$scope.memberships = $scope.$meteorCollection(function() {
					return Memberships.find({
						userId: $rootScope.getReactively('currentUser')._id
					})
				}).subscribe('memberships');
			}

		}],
		scope : {
			multiLine : '@'
		}
	};
});
