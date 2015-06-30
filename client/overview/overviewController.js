'use strict';

var app = angular.module('isa');

/**
 * @note Presently, organisations and their modules are loaded in their entirety.
 *		 should be paginating them?
 * @author Steve Fortune
 */
app.controller('OverviewController',
	['$scope', '$modal', '$meteor', '$state',
	function($scope, $modal, $meteor, $state) {

		$scope.modules = $meteor.collection(Modules);

		//TODO set correct collection by filtering modules collection
		$scope.active = $scope.modules;
		$scope.templates = $scope.modules;
		$scope.archived = $scope.modules;
		$scope.trash = $scope.modules;
/*
	$scope.active = new Collection(function(offset) {
		return OrganisationService.all(offset);
	});

	$scope.templates = new Collection(function(offset) {
		return OrganisationService.all(offset, {
			isTemplate : true
		});
	});

	$scope.archives = new Collection(function(offset) {
		return OrganisationService.all(offset, {
			isArchived : true
		});
	});

	$scope.trash = new Collection(function(offset) {
		return OrganisationService.all(offset, {
			inTrash : true
		});
	});
*/
	$scope.editPlan = function(module) {

		$modal.open({
			templateUrl: '/components/module/view.html',
			controller: 'ModuleController',
			resolve: {
				organisation: angular.noop,
				module: function () {
				  	return module;
				}
			}
		}).result.then(function(updatedPlan) {

			$scope.active.refresh();
			$scope.templates.refresh();
			$scope.trash.refresh();
			$scope.archives.refresh();

			if (angular.isDefined(updatedPlan)) {
				//TODO growl.success('Plan settings have been updated');
			} else {
				//TODO growl.success('Plan has been deleted');
			}

		});

	};

	$scope.addPlan = function() {

		$modal.open({
			templateUrl: 'client/module/module.ng.html',
			controller: 'ModuleController',
			resolve: {
				module : angular.noop,
			}
		}).result.then(function(newModule) {

				console.log('saving', newModule);

				/*if ($scope.isNew) {
				 ModuleService.insertInOrganisation($scope.selectedOrganisation, $scope.module).then(function(module) {
				 $modalInstance.close($scope.module);
				 }, handleErr);
				 } else {
				 ModuleService.updateById($scope.module.id, $scope.module).then(function(module) {
				 $modalInstance.close($scope.module);
				 }, handleErr);
				 }*/

				//save the module
				$scope.modules.save(newModule);

//TODO: next line throws an error:
			//$scope.active.refresh();
			//TODO growl.success('The module has been added');
		});

	};

}]);
