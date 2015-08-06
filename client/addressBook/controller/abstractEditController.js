'use strict';

var app = angular.module('isa.addressbook');

/**
 * Abstract modal controller that deals with object persistence.
 *
 * @param		object		Object		The object to make a copy of and manipulate.
 * @author 	Steve Fortune
 */
app.controller('AddressBookEditController',
	['$scope', '$modalInstance', 'collection', 'object',
	function($scope, $modalInstance, collection, object) {

	/**
	 * Are we creating a new object or editing an already-existing one?
   *
	 * @var Boolean
	 */
	$scope.isNew = !object;

	/**
	 * Our persistent object
	 *
	 * @var Object
	 */
	$scope.object = $scope.isNew ? {} : object;

	/**
	 * Dismisses the modal instance.
	 */
	$scope.cancel = function() {
		$modalInstance.dismiss();
	};

	/**
	 * Last error from save.
	 *
	 * @var Error
	 */
	$scope.err = null;

	/**
	 * @var Boolean
	 */
	$scope.loading = false;

	/**
	 * Successful save callback.
	 *
	 * @var fn
	 */
	$scope.success = function() {
		$scope.loading = false;
		$modalInstance.dismiss();
	};

	/**
	 * Failure save callback.
	 *
	 * @var fn
	 */
	$scope.failure = function(err) {
		$scope.loading = false;
		$scope.err = err;
	};

	/**
	 * Persists our object
	 *
	 * @protected
	 */
	$scope.save = function() {
		$scope.loading = true;
		collection.save($scope.object).then($scope.success, $scope.failure);
	};

}]);
