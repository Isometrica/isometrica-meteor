'use strict';

var app = angular.module('isa.addressbook');

/**
 * @extends AddressBookEditController
 * @author 	Steve Fortune
 */
app.controller('AddressBookEditContactController',
	['$scope', '$modalInstance', '$modal', '$controller', 'object',
	function($scope, $modalInstance, $modal, $controller, object) {

	$controller('AddressBookEditController', {
		$scope: $scope,
		$modalInstance: $modalInstance,
		collection: $scope.$meteorCollection(Contacts),
		object: object
	});

}]);
