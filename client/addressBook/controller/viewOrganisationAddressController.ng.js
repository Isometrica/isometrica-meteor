'use strict';

angular
	.module('isa.addressbook')
	.controller('AddressBookViewOrganisationAddressController', AddressBookViewOrganisationAddressController);

/**
 * @extends AddressBookViewController
 * @author 	Steve Fortune
 */
function AddressBookViewOrganisationAddressController($stateParams, $scope, $modal, $controller) {

	$controller('AddressBookViewController', {
		$scope: $scope,
		$modal: $modal,
		$stateParams: $stateParams,
		collection: OrganisationAddresses,
		editControllerConf: {
			templateUrl: 'client/addressBook/view/editOrganisationAddress.ng.html',
			controller: 'AddressBookEditOrganisationAddressController'
		}
	});

}
