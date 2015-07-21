'use strict';

var app = angular.module('isa.addressbook');

/**
 * @extends AddressBookEditController
 * @author 	Steve Fortune
 */
app.controller('AddressBookEditContactController',
	['$scope', '$modalInstance', '$modal', '$controller', 'entity',
	function($scope, $modalInstance, $modal, $controller, entity) {

	$controller('AddressBookEditController', {
		$scope: $scope,
		$modalInstance: $modalInstance,
		entity: entity
	});

}]);
