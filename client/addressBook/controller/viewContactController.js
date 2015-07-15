'use strict';

var app = angular.module('isa.addressbook');

/**
 * @extends AddressBookViewController
 * @author     Steve Fortune
 */
app.controller('AddressBookReadContactController',
  ['$scope', '$modalInstance', '$modal', '$controller', 'entity',
  function($scope, $modalInstance, $modal, $controller, entity) {

  $controller('AddressBookEditController', {
		$scope: $scope,
		$modalInstance: $modalInstance,
		entity: entity,
		editControllerConf: {
			templateUrl: 'client/addressBook/view/editContact.ng.html',
			controller : 'AddressBookEditContactController'
		}
	});

}]);
