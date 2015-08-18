'use strict';

angular
	.module('isa.addressbook')
	.controller('AddressBookController', AddressBookController);

/**
 * Main controller for address book UI.
 *
 * @route /addressbook
 * @author Steve Fortune
 */
function AddressBookController($scope, $rootScope, $state, $modal, $meteor, organisation) {

	/**
	 * Was the user redirected to this controller with the id of a specific
	 * object in the URL? If so, we need to prevent the initial transition
	 * to the first user on loadMore.
	 *
	 * @var Boolean
	 */
	var redirectToFirst = !!$state.params.id;

	/**
	 * The current organisation
	 *
	 * @var Object
	 */
	$scope.org = organisation;

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
	 * - `route`								String										The nested state
	 * - `collection` 					AngularMeteorCollection		Meteor collection used to page load items from our
	 * 													service.
	 * - `modalControllerConf`	Object										Config used to initialise a modal controller to
	 *																										create a new instance of the object.
	 *
	 * @const Dictionary
	 */
	var selectStates = {
		'Users': {
			route: 'addressbook.user',
			collection: $scope.$meteorCollection(Memberships, false),
			modalControllerConf: {
				templateUrl: 'client/addressBook/view/newUser.ng.html',
				controller : 'AddressBookEditUserController'
			}
		},
		'Contacts': {
			route: 'addressbook.contact',
			collection: $scope.$meteorCollection(Contacts, false).subscribe("contacts"),
			modalControllerConf: {
				templateUrl: 'client/addressBook/view/newContact.ng.html',
				controller : 'AddressBookEditContactController'
			}
		},
		'Organisations': {
			route: 'addressbook.organisation',
			collection: $scope
				.$meteorCollection(OrganisationAddresses, false)
				.subscribe('organisationAddresses'),
			modalControllerConf: {
				templateUrl: 'client/addressBook/view/newOrganisationAddress.ng.html',
				controller : 'AddressBookEditOrganisationAddressController'
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
		$state.go(route, {
			id: item._id
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
	 * Opens a new dialog to register a user.
	 *
	 * @protected
	 */
	$scope.add = function() {

		// TODO: Tidy this up, build a deep merge function

		var currentState = currentSelectState();
		var dstConf = currentState.modalControllerConf;
		var srcResolveConf = {
			object: angular.noop
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

}
