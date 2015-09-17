'use strict';

var app = angular.module('isa.overview');

/**
 * @author Steve Fortune
 */
app.directive('isaModulePanel', function($modal) {
	return {
		template : '<div ng-include="getTemplateUrl()"></div>',
		restrict: 'E',
		scope: {
			modules: '=',
			module: '='
		},
		controller: function($scope) {
			$scope.getTemplateUrl = function() {
				return 'client/overview/' + $scope.module.type + 'Panel.ng.html';
			};

			$scope.getNumPages = function() {
				var c = $scope.module.numPages || 0;
				return c + ( c == 1 ? ' page' : ' pages');
			};

		}
	};
});


