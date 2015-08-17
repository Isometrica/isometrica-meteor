'use strict';

angular
	.module('isa.addressbook')
	.controller('AddressBookEditOrganisationAddressController', AddressBookEditOrganisationAddressController);

/**
 * @extends AddressBookEditController
 * @author 	Steve Fortune
 */
function AddressBookEditOrganisationAddressController($scope, $modalInstance, $modal, $controller, $meteor, object) {

	$controller('AddressBookEditController', {
		$scope: $scope,
		$modalInstance: $modalInstance,
    collection: $scope.$meteorCollection(OrganisationAddresses),
		object: object
	});

}
