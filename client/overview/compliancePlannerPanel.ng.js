'use strict';

var app = angular.module('isa.overview');

/**
 */
app.directive('isaCompliancePlannerPanel', [function() {
	return {
    templateUrl: 'client/overview/compliancePlannerPanel.ng.html',
		restrict: 'E',
		controller: function($scope, actionsService) {
			$scope.items = 12;
			$scope.upcomingItems = 1;
		}
	};
}]);
