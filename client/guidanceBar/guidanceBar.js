var app = angular.module('isa');

app.directive('isaGuidanceBar', [ function() {

	return {

		replace : true,
		transclude: true,
		restrict : 'E',
		templateUrl : 'client/guidanceBar/guidanceBar.ng.html',

		controller : function($scope) {

			$scope.hideBar = false;

			$scope.hideThis = function() {
				$scope.hideBar = true;
			};

		}

	};

}]);
