'use strict';

angular
	.module('isa.addressbook')
	.controller('AddressBookViewContactController', AddressBookViewContactController);

/**
 * @extends AddressBookViewController
 * @author 	Steve Fortune
 */
function AddressBookViewContactController($scope, $modalInstance, $modal, $controller) {

  $controller('AddressBookViewController', {
		$scope: $scope,
		$modalInstance: $modalInstance,
    collection: Contacts,
		editControllerConf: {
			templateUrl: 'client/addressBook/view/editContact.ng.html',
			controller : 'AddressBookEditContactController'
		}
	});

}
