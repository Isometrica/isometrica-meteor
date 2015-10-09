'use strict';

angular
  .module('isa.addressbook')
  .controller('AddressBookEditController', AddressBookEditController);

/**
 * Abstract modal controller that deals with mutating an object.
 *
 * @param    object    Object    The object to make a copy of and manipulate.
 *                              This should not be an AngularMeteorObject.
 * @author   Steve Fortune
 */
function AddressBookEditController($scope, $modalInstance, collection, object) {

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
  $scope.object = $scope.isNew ? {} : angular.copy(object);

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
   * Dismisses the modal instance.
   */
  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  /**
   * Successful save callback.
   *
   * @param op  String
   * @var fn
   */
  $scope.success = function(op) {
    $scope.loading = false;
    $modalInstance.close(op);
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

  /**
   * Deletes the object that we're current updating.
   *
   * @protected
   */
  $scope.delete = function() {
    if ($scope.isNew) {
      throw new Error("Can't delete new objects.");
    }
    $scope.loading = true;
    collection.remove($scope.object).then($scope.success, $scope.failure);
  };

}
