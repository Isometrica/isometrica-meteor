'use strict';

var app = angular.module('isa.overview', [

]);

/**
 * @note Presently, organisations and their modules are loaded in their entirety.
 *		 should be paginating them?
 * @author Steve Fortune
 */
app.controller('OverviewController',
	['$scope', '$modal', '$meteor', '$state',
	function($scope, $modal, $meteor, $state) {

		$scope.modules = $meteor.collection(Modules);

		//setup filters for the data in the tabs on the overview page
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
					case 'delete': 'restore'
						//deleting/ restoring is just about setting the inTrash flag
						$scope.modules.save( result.context );
						break;

					case 'save':

						$scope.modules.save( result.context );
						break;

				}

				return;


			if (angular.isDefined(updatedModule)) {
				//TODO growl.success('Module settings have been updated');
			} else {
				//TODO growl.success('Module has been deleted');
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

				if (result.action == 'save') {
					/*$scope.notAutoTodos.remove(todoId);

					ModuleService.updateById($scope.module.id, angular.extend({}, $scope.module, {
						inTrash : true
					})).then(function(module) {
						$modalInstance.close();
*/

					//save the new/ updated module
					$scope.modules.save(result.context);
				}

			//TODO growl.success('The module has been added');
		});

	};



}]);
