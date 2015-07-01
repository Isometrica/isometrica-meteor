'use strict';

var app = angular.module('isa.addressbook');

/**
 * @extends AddressBookViewController
 * @author 	Steve Fortune
 */
app.controller('AddressBookReadContactController',
	['$stateParams', '$scope', '$rootScope', 'EventNameAssembler', '$controller', 'ContactService', '$modal',
	function($stateParams, $scope, $rootScope, EventNameAssembler, $controller, ContactService, $modal) {

	$controller('AddressBookViewController', {
		$stateParams: $stateParams,
		$scope: $scope,
		$rootScope, $rootScope,
		$modal: $modal,
		EventNameAssembler: EventNameAssembler,
		service: ContactService,
		type: 'contact',
		editControllerConf: {
			templateUrl: '/components/addressBook/view/editContact.html',
			controller : 'AddressBookEditContactController',
			resolve: {
				callTree: angular.noop
			}
		}
	});

}]);
