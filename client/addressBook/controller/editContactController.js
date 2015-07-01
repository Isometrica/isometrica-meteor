'use strict';

var app = angular.module('isa.addressbook');

/**
 * @extends AddressBookEditController
 * @author 	Steve Fortune
 */
app.controller('AddressBookEditContactController',
	['ContactService', '$scope', '$rootScope', '$modalInstance', 'EventNameAssembler', '$controller', 'entity',
	function(ContactService, $scope, $rootScope, $modalInstance, EventNameAssembler, $controller, entity) {

	$controller('AddressBookEditController', {
		$scope: $scope,
		$rootScope: $rootScope,
		$modalInstance: $modalInstance,
		service: ContactService,
		EventNameAssembler: EventNameAssembler,
		entity: entity,
		type: 'contact'
	});

}]);
