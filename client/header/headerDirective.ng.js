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
				 * Current user's existing memberships
				 *
				 * @var AngularMeteorCollection
				 */
				$scope.memberships = $scope.$meteorCollection(function() {
					return Memberships.find({
						userId: $rootScope.currentUser ? $rootScope.currentUser._id : null
					});
				});

				$scope.hasAccounts = function() {
					return !!BillingAccounts.find().count();
				};

				$scope.hasMultipleAccounts = function() {
					return BillingAccounts.find().count() > 1;
				};

				$scope.firstAccount = $scope.$meteorObject(BillingAccounts, {});
			}

		}],
		scope : {
			multiLine : '@'
		}
	};
});
