var app = angular.module('isa');

app.directive('isaGuidanceBar', [ function() {

	return {

		scope : {
			moreHelpLink : '@',
			supportLink : '@',
			showPlaceholder : '@'
		},
		replace : true,
		transclude: true,
		restrict : 'E',
		templateUrl : 'client/guidanceBar/guidanceBar.ng.html',

		controller : function($rootScope, $scope) {

			$scope.hideBar = false;

			$scope.hideThis = function() {
				$scope.hideBar = true;
				$rootScope.isaGuidanceBarHidden = true;
			};

		}

	};

}]);
