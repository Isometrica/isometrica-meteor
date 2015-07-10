'use strict';

var app = angular.module('isa.overview');

/**
 * @author Steve Fortune
 */
app.directive('isaModulePanel', [function() {
	return {
		templateUrl: 'client/overview/module.ng.html',
		restrict: 'E',
		scope: {
			title: '@',
			description: '@',
			link: '@'
		}
	};
}]);
