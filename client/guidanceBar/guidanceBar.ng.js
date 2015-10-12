var app = angular.module('isa');

app.directive('isaGuidanceBar', [ function() {

	return {

		scope : {
			moreHelpLink : '@',
			supportLink : '@',
			showPlaceholder : '@',
			textId : '@'
		},
		replace : true,
		transclude: true,
		restrict : 'E',
		templateUrl : 'client/guidanceBar/guidanceBar.ng.html',

		controller : function($rootScope, $scope) {

			$scope.hideBar = false;

			$scope.hideThis = function() {
				if ($scope.textId) {
					Meteor.users.update($rootScope.currentUser._id, {$addToSet: {'profile.hiddenGuidance': $scope.textId }});
				}
				$scope.hideBar = true;
			};

			if ($scope.textId) {
				var t = SystemTexts.findOne( { textId : $scope.textId });
				$scope.guidanceText = ( t ? t.contents : $scope.textId);
				$scope.hideBar = -1 !== _.indexOf($rootScope.currentUser.profile.hiddenGuidance, $scope.textId);
			}

		}

	};

}]);
