'use strict';

angular
	.module('isa.addressbook')
	.controller('AddressBookEditUserController', AddressBookEditUserController);

/**
 * @extends AddressBookEditController
 * @author 	Steve Fortune
 */
function AddressBookEditUserController($scope, $modalInstance, $modal, $controller, $meteor, object) {

	$controller('AddressBookEditController', {
		$scope: $scope,
		$modalInstance: $modalInstance,
		collection: angular.noop,
		object: object
	});

	var success = function() {
		console.log('Success: ' + arguments);
	};
	var failure = function(err) {
		console.log(err);
	};

	/**
	 * @protected
	 * @override
	 */
	$scope.save = function() {
		console.log($scope.object);
		if ($scope.isNew) {
			$meteor.mtCall('registerOrganisationUser', $scope.object).then(success, failure);
		} else {
			$meteor.mtCall('updateUser', $scope.object._id, $scope.object, {});
		}
	}

}
