'use strict';

var app = angular.module('isa.addressbook');

/**
 * Non-modal controller for rendering a readonly-view on an entity.
 *
 * @param		editControllerConf	Object		Configuration for a modal dialog to display on edit.
 * @param		$stateParams				Object		Requires an `id` key.
 * @author 	Steve Fortune
 */
app.controller('AddressBookViewController',
	['$stateParams', '$modal', '$scope', 'editControllerConf',
	function($stateParams, $modal, $scope, editControllerConf) {

	/**
	 * @var String
	 */
	var id = $stateParams.id;

	// TODO: Find entity

	/**
	 * Simple convenience method that opens an modal controller.
	 *
	 * @note Couldn't make use of angular.merge because of our target angular vn
	 */
	$scope.editEntity = function() {
		var srcResolveConf = {
			entity: function() {
				return $scope.entity;
			},
		};
		var mergedConf = angular.extend(editControllerConf, {
			resolve: editControllerConf.resolve ?
				angular.extend(editControllerConf.resolve, srcResolveConf) :
				srcResolveConf
		});
		$modal.open(mergedConf);
	};

}]);
