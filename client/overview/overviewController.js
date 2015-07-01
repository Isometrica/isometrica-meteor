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

		//active: template:false, trash:false, archived:false
		//$scope.active = $meteor.collection(
		//	Modules.find( { $and : [{ inTrash : false }, { isArchived : false}, {isTemplate:false}] } ) );

		$scope.active = $scope.modules;


		//TODO set correct collection by filtering modules collection
		//template=false, trash=false, archived=false

		$scope.templates = $scope.modules;
		//template=true, trash=false, archived=false

		$scope.archived = $scope.modules;
		//trash=false, archived=true

		$scope.trash = $scope.modules;
		//trash = true
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
	$scope.editModule = function(module) {

		$modal.open({
			templateUrl: '/components/module/view.html',
			controller: 'ModuleController',
			resolve: {
				organisation: angular.noop,
				module: function () {
				  	return module;
				}
			}
		}).result.then(function(updatedModule) {

			$scope.active.refresh();
			$scope.templates.refresh();
			$scope.trash.refresh();
			$scope.archives.refresh();

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
		}).result.then(function(newModule) {

				//set defaults
				newModule.isTemplate = false;
				newModule.isArchived = false;
				newModule.inTrash = false;
				newModule.orgId = '123';		//TODO: fix

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
				console.log('done');

				console.log($scope.modules);

//TODO: next line throws an error:
			//$scope.active.refresh();
			//TODO growl.success('The module has been added');
		});

	};

}]);
