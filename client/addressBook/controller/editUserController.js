'use strict';

var app = angular.module('isa.addressbook');

/**
 * @extends AddressBookEditController
 * @author 	Steve Fortune
 */
app.controller('AddressBookEditUserController',
	['UserService', 'CallTreeService', 'Collection', 'PhoneNumberService', '$scope', '$rootScope', '$modalInstance', '$modal', 'EventNameAssembler', '$controller', 'entity',
	function(UserService, CallTreeService, Collection, PhoneNumberService, $scope, $rootScope, $modalInstance, $modal, EventNameAssembler, $controller, entity) {

	$controller('AddressBookEditController', {
		$scope: $scope,
		$rootScope: $rootScope,
		$modalInstance: $modalInstance,
		service: UserService,
		EventNameAssembler: EventNameAssembler,
		entity: entity,
		type: 'user'
	});

	/**
	 * Cache. In-mem kv store, obj IDs paired with call tree contacts.
	 *
	 * @private
	 * @var Object
	 */
	var objCache = {};

	/**
	 * Asynchronously loads the phone numbers associated with the contact of
	 * a given call tree node.
	 *
	 * @private
	 * @param	node	Object
	 */
	var loadNodeContact = function(node) {
		var cachedNos = objCache[node.id];
		if (cachedNos) {
			node.phoneNumbers = cachedNos;
		} else {
			var contactable;
			if (node.user) {
				contactable = node.user;
				contactable.type = 'user';
			} else {
				contactable = node.contact;
				contactable.type = 'contact';
			}
			PhoneNumberService.all(contactable).then(function(numbers) {
				node.phoneNumbers = numbers;
				objCache[node.id] = numbers;
			}, function(err) {
				node.loadErr = err;
			});
		}
	};

	/**
	 * Nodes in our call tree.
	 *
	 * @var Collection
	 */
	$scope.nodes = new Collection(function(offset) {
		return CallTreeService.findTree(entity).then(function(nodes) {
			angular.forEach(nodes, loadNodeContact);
			return nodes;
		});
	}, !$scope.isNew);

	/**
	 * New phone number object
	 *
	 * @var Object
	 */
	$scope.newPhoneNumber = {};

	/**
	 * @extends sanatizeEntity
	 */
	$scope.sanatizeEntity = function(user) {
		delete user.password;
	};

	/**
	 * @param	item	Contact to add to call tree
	 */
	$scope.addCallTreeNode = function(item) {
		CallTreeService.add(entity, item).then(function() {
			$scope.nodes.refresh();
		}, function(err) {});
	};

	/**
	 * @param	item	Node to remove from call tree
	 */
	$scope.removeCallTreeNode = function(item) {
		CallTreeService.delete(item).then(function() {
			$scope.nodes.refresh();
		}, function(err) {});
	};

	/**
	 * @param	search	String
	 * @return 	Promise
	 */
	$scope.findItems = function(search) {
		return CallTreeService.searchNodes(search);
	};

}]);
