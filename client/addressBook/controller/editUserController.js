'use strict';

var app = angular.module('isa.addressbook');

/**
 * @extends AddressBookEditController
 * @author 	Steve Fortune
 */
app.controller('AddressBookEditUserController',
	['$scope', '$modalInstance', '$modal', '$controller', 'entity',
	function($scope, $modalInstance, $modal, $controller, entity) {

	$controller('AddressBookEditController', {
		$scope: $scope,
		$modalInstance: $modalInstance,
		entity: entity
	});

}]);
