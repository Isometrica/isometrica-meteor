'use strict';

angular
	.module('isa.addressbook')
	.controller('AddressBookViewController', AddressBookViewController);

/**
 * Non-modal controller for rendering a readonly-view on an entity.
 *
 * @param		editControllerConf	Object							Configuration for a modal dialog to display on edit.
 * @param		$stateParams				Object							Requires an `id` key.
 * @param		collection					Mongo.Collection		A collection.
 * @author 	Steve Fortune
 */
function AddressBookViewController($stateParams, $modal, $scope, editControllerConf, collection) {

	/**
	 * @var String
	 */
	var id = $stateParams.id;

	/**
	 * Reactive meteor object for the user.
	 *
	 * @var AngularMeteorObject
	 */
	$scope.object = $scope.$meteorObject(collection, id, false);

	/**
	 * Simple convenience method that opens a modal controller.
	 *
	 * @note Couldn't make use of deep angular.merge because of
	 * 			 our target angular vn.
	 */
	$scope.editObject = function() {
		var srcResolveConf = {
			object: function() {
				return $scope.object.getRawObject();
			},
		};
		var mergedConf = angular.extend(editControllerConf, {
			windowClass: 'isometrica-addressbook-edit-modal',
			resolve: editControllerConf.resolve ?
				angular.extend(editControllerConf.resolve, srcResolveConf) :
				srcResolveConf
		});
		$modal.open(mergedConf);
	};

}
