'use strict';

var app = angular.module('isa.addressbook');

/**
 * @extends AddressBookViewController
 * @author 	Steve Fortune
 */
app.controller('AddressBookReadUserController',
	['$stateParams', '$scope', '$rootScope', 'EventNameAssembler', '$controller', 'UserService', '$modal',
	function($stateParams, $scope, $rootScope, EventNameAssembler, $controller, UserService, $modal) {

	$controller('AddressBookViewController', {
		$stateParams: $stateParams,
		$scope: $scope,
		$rootScope, $rootScope,
		$modal: $modal,
		EventNameAssembler: EventNameAssembler,
		service: UserService,
		type: 'user',
		editControllerConf: {
			templateUrl: '/components/addressBook/view/editUser.html',
			controller : 'AddressBookEditUserController'
		}
	});

}]);
