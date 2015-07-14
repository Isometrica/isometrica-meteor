'use strict';

var app = angular.module('isa.overview');

/**
 * @author Steve Fortune
 */
app.directive('isaModulePanel', [function() {
	return {
		templateUrl: function(elm, attrs) {
			var type = attrs.type || 'basic';
			return 'client/overview/panel/' + type + '.ng.html'
		},
		restrict: 'E',
		scope: {
			opts: '='
		}
	};
}]);
