'use strict';

var app = angular.module('isa.overview');

/**
 * @author Steve Fortune
 */
app.directive('overviewSection', [function() {
	return {
		templateUrl: 'client/overview/section.ng.html',
		restrict: 'E',
		link: function(scope, elm, attrs) {
			scope.hasModules = function() {
				return scope.sections ? scope.sections.arr.reduce(function(cummulative, section) {
					return section.modules ? cummulative + section.modules.length : cummulative;
				}, 0) : false;
			};
		},
		scope: {
			sections: '=',
			filter: '=',
			emptyMessage: '@',
			onAdd: '&',
			onOpenModule: '&',
			onEditModule: '&'
		}
	};
}]);
