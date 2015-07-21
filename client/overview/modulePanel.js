'use strict';

var app = angular.module('isa.overview');

/**
 * @author Steve Fortune
 */
app.directive('isaModulePanel', function() {
	return {
		templateUrl: 'client/overview/modulePanel.ng.html',
		restrict: 'E',
		scope: {
			module: '='
		}
	};
});
