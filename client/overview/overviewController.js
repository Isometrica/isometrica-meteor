'use strict';

var app = angular.module('isa');

/**
 * @note Presently, organisations and their modules are loaded in their entirety.
 *		 should be paginating them?
 * @author Steve Fortune
 */
app.controller('OverviewController',
	['$scope', '$modal', '$state',
	function($scope, $modal, $state) {
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
			templateUrl: '/components/module/view.html',
			controller: 'ModuleController',
			resolve: {
				module : angular.noop,
			}
		}).result.then(function() {
			$scope.active.refresh();
			//TODO growl.success('The module has been added');
		});

	};

}]);
