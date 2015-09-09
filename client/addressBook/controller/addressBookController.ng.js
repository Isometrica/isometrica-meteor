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
   * Spin this subscription up here to guarentee that any isaProfileImg
   * directive further down the view heirarchy will be able to query
   * the IsaProfileImages.
   */
  $scope.$meteorSubscribe('profileImages');

  /**
   * Was the user redirected to this controller with the id of a specific
   * object in the URL? If so, we need to prevent the initial transition
   * to the first user on loadMore.
   *
   * @var Boolean
   */
  var redirectToFirst = !$state.params.id;

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
   * - `route`                String                    The nested state
   * - `collection`           AngularMeteorCollection    Meteor collection used to page load items from our
   *                           service.
   * - `modalControllerConf`  Object                    Config used to initialise a modal controller to
   *                                                    create a new instance of the object.
   *
   * @const Dictionary
   */
  var selectStates = {
    'Users': {
      route: 'addressbook.user',
      /// @note Because Meteor.users isn't a partitioned collection, we need to
      /// perform a manual client-side join here. We _could_ just use the membership
      /// 'user()' helper method to retrieve the user directly in the template,
      //// but we run into uses with the $digest cycle.
      collection: $scope.$meteorCollection(function() {
        var mems = Memberships.find({}).fetch();
        return Meteor.users.find({
          _id: {
            $in: mems.map(function(mem) {
              return mem.userId;
            })
          }
        });
      }),
      modalControllerConf: {
        templateUrl: 'client/addressBook/view/editUser.ng.html',
        controller : 'AddressBookEditUserController'
      }
    },
    'Contacts': {
      route: 'addressbook.contact',
      collection: $scope.$meteorCollection(Contacts, false).subscribe("contacts"),
      modalControllerConf: {
        templateUrl: 'client/addressBook/view/editContact.ng.html',
        controller : 'AddressBookEditContactController'
      }
    },
    'Organizations': {
      route: 'addressbook.organisation',
      collection: $scope
        .$meteorCollection(OrganisationAddresses, false)
        .subscribe('organisationAddresses'),
      modalControllerConf: {
        templateUrl: 'client/addressBook/view/editOrganisationAddress.ng.html',
        controller : 'AddressBookEditOrganisationAddressController'
      }
    }
  };

  /**
   * Convenience method. Returns the collection of the current state.
   *
   * @return   Collection
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
      windowClass: 'isometrica-addressbook-edit-modal',
      resolve: dstConf.resolve ?
        angular.extend(dstConf.resolve, srcResolveConf) :
        srcResolveConf
    });

    $modal.open(mergedConf);
  };

  /**
   * Watch the select state and transition to the first item in the list if
   * possible.
   */
  $scope.$watch('selectState', function() {
    var col = $scope.collection();
    if (col.length && redirectToFirst) {
      $scope.showDetail(col[0]);
    }
    redirectToFirst = true;
  });

}
