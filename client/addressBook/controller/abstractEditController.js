'use strict';

var app = angular.module('isa.addressbook');

/**
 * Abstract modal controller that deals with entity persistence.
 *
 * @param	entity		Object		The object to make a copy of and manipulate.
 * @author 	Steve Fortune
 */
app.controller('AddressBookEditController',
	['$scope', '$modalInstance', 'entity',
	function($scope, $modalInstance, entity) {

	/**
	 * Are we creating a new entity or editing an already-existing one?
   *
	 * @var Boolean
	 */
	$scope.isNew = !entity;

	/**
	 * Our persistent entity
	 *
	 * @var Object
	 */
	$scope.entity = $scope.isNew ? {} : angular.copy(entity);

	/**
	 * Dismisses the modal instance.
	 */
	$scope.cancel = function() {
		$modalInstance.dismiss();
	};

	/**
	 * Persists our entity
	 *
	 * @protected
	 */
	$scope.save = function() {
		if (!$scope.isNew) {
			throw new Error("Not creating entity.");
		}
		// TODO: Save, close
	};

}]);
