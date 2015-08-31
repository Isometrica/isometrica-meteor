'use strict';

var app = angular.module('isa.overview');

app.controller('OverviewController',
	['$scope', '$modal', '$meteor', '$state', 'growl',
	function($scope, $modal, $meteor, $state, growl) {
	
	$scope.modules = $scope.$meteorCollection(Modules, false);

	$scope.activeFilter = function(module) {
		return !module.inTrash && !module.isTemplate && !module.isArchived;
	};
	$scope.trashedFilter = function(module){
		return module.inTrash;
	};
	$scope.archivedFilter = function(module) {
		return !module.inTrash && module.isArchived;
	};
	$scope.templateFilter = function(module) {
		return !module.inTrash && !module.isArchived && module.isTemplate;
	};

	$scope.addModule = function() {

		$modal.open({
			templateUrl: 'client/module/module.ng.html',
			controller: 'ModuleController',
			resolve: {
				modules : function() {
					return $scope.modules;
				},
				module : angular.noop,
			}
		});

	};

}]);
