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

				$scope.$meteorAutorun(function() {

					/**
					 * Current organisation object
					 *
					 * @var AngularMeteorObject
					 */
					$scope.currentOrg = $scope.$meteorObject(Organisations, MultiTenancy.orgId());

					/**
					 * Default org to redirect to
					 *
					 * @var AngularMeteorObject
					 */
					$scope.defaultOrg = Organisations.findOne();

				});

				/**
				 * Current user's existing memberships
				 *
				 * @var AngularMeteorCollection
				 */
				$scope.memberships = $scope.$meteorCollection(function() {
					return Memberships.find({
						userId: $rootScope.currentUser ? $rootScope.currentUser._id : null
					});
				}).subscribe('memberships');
			}

		}],
		scope : {
			multiLine : '@'
		}
	};
});
