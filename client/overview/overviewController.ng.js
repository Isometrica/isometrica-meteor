angular
	.module('isa.overview')
	.controller('OverviewController', overviewController);
'use strict';

function overviewController($scope, $modal, organisation, $stateParams, $location) {
	$scope.tabs = {
		workspace: false,
		dashboard: false,
		templates: false,
		deleted: false,
		services: false
	};

	$scope.tabs[$stateParams.view || 'workspace'] = true;
	$scope.switchTo = function(val) {
		$location.search('view', val);
	}

	$scope.organisation = organisation;
	$scope.modules = $scope.$meteorCollection(isa.utils.findAll(Modules), false);

	$scope.hasArchivedModules = function() {
		return !_.isUndefined( _.findWhere( $scope.modules, {isArchived:true, inTrash:false} )) ;
	};

	$scope.hasDeletedModules = function() {
		return !_.isUndefined( _.findWhere( $scope.modules, {inTrash:true} )) ;
	};

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
}

