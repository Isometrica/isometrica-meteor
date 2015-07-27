'use strict';

var app = angular.module('isa.overview');

/**
 */
app.directive('isaDashboardPanel', [function() {
	return {
    templateUrl: 'client/overview/dashboardPanel.ng.html',
		restrict: 'E'
	};
}]);
