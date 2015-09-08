'use strict';

var app = angular.module('isa.overview');

/**
 */
app.directive('isaWorkInboxPanel', [function() {
	return {
    templateUrl: 'client/overview/workInboxPanel.ng.html',
		restrict: 'E',
		controller: function($scope, actionsService) {
			$scope.actions = actionsService.actionCount($scope);
		}
	};
}]);
