'use strict';

var app = angular.module('isa.addressbook');

/**
 * Non-modal controller for rendering a readonly-view on an entity.
 *
 * @param	service				Object		A persistent service.
 * @param	type				String		String identifying the type of the entity.
 * @param	editControllerConf	Object		Configuration for a modal dialog to display on edit.
 * @param	$stateParams		Object		Requires an `id` key.
 * @author 	Steve Fortune
 */
app.controller('AddressBookViewController',
	['$stateParams', '$modal', '$scope', '$rootScope', 'EventNameAssembler', 'service', 'type', 'editControllerConf',
	function($stateParams, $modal, $scope, $rootScope, EventNameAssembler, service, type, editControllerConf) {

	/**
	 * Has the load complete.
	 *
	 * @var Boolean
	 */
	$scope.hasLoaded = false;

	/**
	 * @var String
	 */
	var id = $stateParams.id;

	service.findById(id).then(function(entity) {
		$scope.entity = entity;
	}, function(error) {
		// TODO: Error handling
	}).finally(function() {
		$scope.hasLoaded = true;
	});

	/**
	 * Listen to udpate events and refresh our entity to avoid rendering
	 * old data.
	 *
	 * @private
	 */
	$rootScope.$on(EventNameAssembler(type, 'update', id), function(event, newEntity) {
		$scope.entity = newEntity;
	});

	/**
	 * Simple convenience method that opens an abstractEditController-derived controller.
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
