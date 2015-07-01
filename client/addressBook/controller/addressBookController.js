'use strict';

var app = angular.module('isa.addressbook');

/**
 * Main controller for address book UI.
 *
 * @route /addressbook
 * @author Steve Fortune
 */
app.controller('AddressBookController',
	['UserService', 'ContactService', 'CallTreeService', 'Collection', '$scope', '$rootScope', '$state', '$modal',
	function(UserService, ContactService, CallTreeService, Collection, $scope, $rootScope, $state, $modal){

	/**
	 * Was the user redirected to this controller with the id of a specific
	 * entity in the URL? If so, we need to prevent the initial transition
	 * to the first user on loadMore.
	 *
	 * @var Boolean
	 */
	var redirectToFirst = !!$state.params.id;

	/**
	 * The select filter state.
	 *
	 * @var String
	 */
	$scope.selectState = 'Users';

	/**
	 * A map of select states to config objects. These objects contain the
	 * following properties:
	 *
	 * - `route`				String					The nested state
	 * - `collection` 			Collection				A collection used to page load items from our
	 * 													service.
	 * - `modalControllerConf`	Object					Config used to initialise a modal controller to
	 *													create a new instance of the entity.
	 *
	 * @const Dictionary
	 */
	var selectStates = {
		'Users': {
			route: 'addressbook.user',
			collection: new Collection(function(offset) {
				return UserService.all(offset);
			}),
			modalControllerConf: {
				templateUrl: '/components/addressBook/view/newUser.html',
				controller : 'AddressBookEditUserController',
			}
		},
		'Contacts': {
			route: 'addressbook.contact',
			collection: new Collection(function(length) {
				return ContactService.all(length);
			}),
			modalControllerConf: {
				templateUrl: '/components/addressBook/view/newContact.html',
				controller : 'AddressBookEditContactController'
			}
		},
		'In call tree': {
			route: function(item) {
				if (item.userId) {
					return "addressbook.user";
				} else if (item.contactId) {
					return "addressbook.contact";
				} else {
					throw new Error("Unsupported call tree node type");
				}
			},
			collection: new Collection(function(offset) {
				return CallTreeService.all(offset);
			}),
			modalControllerConf: {
				templateUrl: '/components/addressBook/view/newUser.html',
				controller : 'AddressBookEditUserController',
			}
		}
	};

	/**
	 * Convenience method. Returns the collection of the current state.
	 *
	 * @return 	Collection
	 */
	$scope.collection = function() {
		return currentSelectState().collection;
	};

	/**
	 * Redirects us to the state based on the item.
	 */
	$scope.showDetail = function(item) {
		var route = currentSelectState().route;
		if (!route) {
			return;
		} else if (angular.isFunction(route)) {
			route = route(item);
		}
		$state.go(route, {
			id: item.id
		});
	};

	/**
	 * Retrieves the keys from our selectState object.
	 *
	 * @return Array
	 */
	$scope.selectOptions = function() {
		return Object.keys(selectStates);
	};

	/**
	 * Returns the config object for the current select state.
	 *
	 * @private
	 * @return Object
	 */
	var currentSelectState = function() {
		return selectStates[$scope.selectState];
	};

	/**
	 * Constructs a guery and loads more from our service
	 *
	 * @protected
	 */
	$scope.loadMore = function() {
		var currentState = currentSelectState();
		var collection = currentState.collection;
		collection.more().then(function(args) {
			if (args.firstSuccessfulQuery && !redirectToFirst) {
				$scope.showDetail(args.items[0]);
			}
		});
	};

	/**
	 * Opens a new dialog to register a user.
	 *
	 * @protected
	 */
	$scope.add = function() {

		// TODO: Tidy this up, build a deep merge function

		var currentState = currentSelectState();
		var dstConf = currentState.modalControllerConf;
		var srcResolveConf = {
			entity: angular.noop
		};
		var mergedConf = angular.extend(dstConf, {
			resolve: dstConf.resolve ?
				angular.extend(dstConf.resolve, srcResolveConf) :
				srcResolveConf
		});

		$modal.open(mergedConf).result.then(function(user) {
			currentState.collection.refresh();
		}, function(error) {
			if (error) {
				// TODO Handle
			}
		});
	};

	/**
	 * Watches the state of the select box to trigger the first load.
	 *
	 * @protected
	 */
	$scope.$watch('selectState', function(newState, oldState) {
		if (newState !== oldState) {
			redirectToFirst = false;
		}
		$scope.collection().refresh();
		$scope.loadMore();
	});

	/**
	 * Listens for model changes and updates the controller's local collections
	 *
	 * @protected
	 */
	$rootScope.$on('user.update', function(ev, updatedUser) {
		selectStates['Users'].collection.refresh();
	});
	$rootScope.$on('contact.update', function(ev, updateContact) {
		selectStates['Contacts'].collection.refresh();
	});

}]);
