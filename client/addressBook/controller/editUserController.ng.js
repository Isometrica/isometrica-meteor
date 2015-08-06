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

	/**
	 * @protected
	 * @override
	 */
	$scope.save = function() {
		$scope.loading = true;
		if ($scope.isNew) {
			$meteor
				.mtCall('registerOrganisationUser', $scope.object)
				.then($scope.success, $scope.failure);
		} else {
			$meteor
				.mtCall('updateUser', $scope.object._id, $scope.object, {})
				.then($scope.success, $scope.failure);
		}
	}

}
