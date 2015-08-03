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

			/*$scope.editModule = function(module) {
				console.log('edit');

				$modal.open({
					templateUrl: 'client/module/module.ng.html',
					controller: 'ModuleController',
					resolve: {
						organisation: angular.noop,
						modules : function() {
							return $scope.modules;
						},
						module: function () {
						  	return $scope.module;
						}
					}
				});

			};*/
		}
	};
});


