'use strict';

var app = angular.module('isa.overview');

/**
 * @author Steve Fortune
 */
app.directive('isaModulePanel', function() {
	return {
		template : '<div ng-include="getTemplateUrl()"></div>',
		restrict: 'E',
		scope: {
			module: '='
		},
		controller: function($scope) {
			$scope.getTemplateUrl = function() {
				return 'client/overview/' + $scope.module.type + 'Panel.ng.html';
			};
		}
	};
});


