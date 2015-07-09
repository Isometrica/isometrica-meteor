'use strict';

var app = angular.module('isa.overview');

/**
 * @author Steve Fortune
 */
app.directive('isaOverviewSection', [function() {
	return {
		templateUrl: 'client/overview/section.ng.html',
		restrict: 'E',
		scope: {
			modules: '=',
			filter: '=',
			emptyMessage: '@',
			onAdd: '&',
			onOpenModule: '&',
			onEditModule: '&'
		}
	};
}]);
