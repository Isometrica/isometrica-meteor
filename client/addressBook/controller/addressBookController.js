'use strict';

var app = angular.module('isa.addressbook');

/**
 * Main controller for address book UI.
 *
 * @route /addressbook
 * @author Steve Fortune
 */
app.controller('AddressBookController',
	['$scope', '$rootScope', '$state', 'organisation', '$modal', '$meteor',
	function($scope, $rootScope, $state, organisation, $modal, $meteor){

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
	 * - `route`								String					The nested state
	 * - `collection` 					Collection			Meteor collection used to page load items from our
	 * 													service.
	 * - `modalControllerConf`	Object					Config used to initialise a modal controller to
	 *													create a new instance of the entity.
	 *
	 * @todo Clearly the "1234" is a temporary organisation ID
	 * @const Dictionary
	 */
	var selectStates = {
		'Users': {
			route: 'addressbook.user',
			collection: $meteor.collection(Memberships, false).subscribe("memberships", organisation._id),
			modalControllerConf: {
				templateUrl: 'client/addressBook/view/newUser.html',
				controller : 'AddressBookEditUserController',
			}
		},
		'Contacts': {
			route: 'addressbook.contact',
			collection: $meteor.collection(Contacts, false).subscribe("contacts", organisation._id),
			modalControllerConf: {
				templateUrl: 'client/addressBook/view/newContact.html',
				controller : 'AddressBookEditContactController'
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
		//var route = currentSelectState().route;
		//$state.go(route, {
		//	id: item.id
		//});
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
	$scope.loadMore = function() {};

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

}]);
