'use strict';

angular
	.module('isa.addressbook')
	.controller('AddressBookViewContactController', AddressBookViewContactController);

/**
 * @extends AddressBookViewController
 * @author 	Steve Fortune
 */
function AddressBookViewContactController($stateParams, $scope, $modal, $controller) {

  $controller('AddressBookViewController', {
		$scope: $scope,
    $stateParams: $stateParams,
		$modal: $modal,
    collection: Contacts,
		editControllerConf: {
			templateUrl: 'client/addressBook/view/editContact.ng.html',
			controller: 'AddressBookEditContactController'
		}
	});

}
