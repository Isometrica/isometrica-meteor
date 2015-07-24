'use strict';

var app = angular.module('isa.overview');

app.controller('OverviewController',
	['$scope', '$modal', '$meteor', '$state', 'growl',
	function($scope, $modal, $meteor, $state, growl) {

	/**
	 * @var AngularMeteorCollection
	 */
	$scope.modules = $scope.$meteorCollection(Modules, false).subscribe('modules');

	$scope.activeFilter = function(module) {
		return !module.inTrash && !module.isTemplate && !module.isArchived;
	}
	$scope.trashedFilter = function(module){
		return module.inTrash;
	}
	$scope.archivedFilter = function(module) {
		return !module.inTrash && module.isArchived;
	}
	$scope.templateFilter = function(module) {
		return !module.inTrash && !module.isArchived && module.isTemplate;
	}

	$scope.editModule = function(module) {

		$modal.open({
			templateUrl: 'client/module/module.ng.html',
			controller: 'ModuleController',
			resolve: {
				organisation: angular.noop,
				module: function () {
				  	return module;
				}
			}
		}).result.then(function(result) {

			switch (result.action) {
				case 'delete':
					//deleting is about setting the inTrash flag
					$scope.modules.save( result.context).then( function() {

						if (result.context.type == 'docwiki') {
							growl.success('Document "' + result.context.title + '" has been moved to the trash');
						} else {
							growl.success('The module "' + result.context.title + '" has been moved to the trash');
						}

					})
					break;

				case 'restore':

					//restoring is about setting the inTrash flag
					$scope.modules.save( result.context).then( function() {

						if (result.context.type == 'docwiki') {
							growl.success('Document "' + result.context.title + '" has been restored from the trash');
						} else {
							growl.success('The module "' + result.context.title + '" has been restored from the trash');
						}

					});
					break;

				case 'save':

					$scope.modules.save( result.context).then( function() {
						growl.success('Module settings have been updated');
					});
					break;

			}

		});

	};

	$scope.addModule = function() {

		$modal.open({
			templateUrl: 'client/module/module.ng.html',
			controller: 'ModuleController',
			resolve: {
				module : angular.noop,
			}
		}).result.then(function(result) {

				if (result.action === 'save') {

					//save the new/ updated module
					$scope.modules.save(result.context)
						.then( function() {
							growl.success('The module has been added');
						});
				}

		});

	};

}]);
