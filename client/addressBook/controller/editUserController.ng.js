'use strict';

angular
  .module('isa.addressbook')
  .filter('group', AddressBookGroupFilter)
  .controller('AddressBookEditUserController', AddressBookEditUserController);


/**
 * Filter that groups an array's elements into sets, where |set| = n.
 *
 * @author Steve Fortune
 */
function AddressBookGroupFilter() {
  return _.memoize(function(arr, cols) {
    var cp = [];
    var rows = arr.length/cols;
    for (var i = 0, arrI = 0; i < rows; ++i) {
      var row = [];
      for (var j = 0; j < cols && arrI < arr.length; ++j, ++arrI) {
        row.push(arr[arrI]);
      }
      cp.push(row);
    }
    return cp;
  });
}

/**
 * @extends AddressBookEditController
 * @author   Steve Fortune
 */
function AddressBookEditUserController($scope, $rootScope, $modalInstance, $modal, $subs, $controller, $meteor, $state, object, growl, initialsFilter) {

  $controller('AddressBookEditController', {
    $scope: $scope,
    $modalInstance: $modalInstance,
    collection: angular.noop,
    object: object
  });

  /**
   * Local user collection.
   *
   * @var AngularMeteorCollection
   */
  var users = $scope.$meteorCollection(Meteor.users, false);

  /**
   * Local memberships collection.
   *
   * @var AngularMeteorCollection
   */
  $scope.memberships = $scope.$meteorCollection(isa.utils.findAll(Memberships), false);

  if ($scope.isNew) {

    /**
     * New, empty membership !
     *
     * @var Object
     */
    $scope.membership = {};

    /**
     * Clean so that default and autoValues are populated for
     * new user object.
     */
    Schemas.User.clean($scope.object);
    Schemas.Membership.clean($scope.membership);

    /**
     * @var Object
     */
    var profile = $scope.object.profile;

    /**
     * Watch the user's firstName and lastName attributes so that we can
     * re-compute the initials.
     */
    $scope.$watch(function() {
      if (profile.firstName && profile.lastName) {
        return profile.firstName + ' ' + profile.lastName;
      }
    }, function(newVal) {
      if (newVal) {
        profile.initials = initialsFilter(newVal);
      }
    });

    /**
     * @protected
     * @override
     */
    $scope.save = function() {
      $scope.loading = true;
      $meteor
        .mtCall('registerOrganisationUser', $scope.object, $scope.membership)
        .then($scope.success, $scope.failure);
    };

  } else {

    $subs.needBind($scope, 'modules');

    /**
     * Creates a copy of the existing object with key attributes
      * having been rearrange to the appropriate position in the
     * document.
     *
     * @return Object
     */
    var createPayload = function() {
      var user = angular.copy($scope.object);
      user.emails[0].address = user.email;
      delete user.email;
      return user;
    };

    /**
     * Are we editing the current logged in user?
     *
     * @return Boolean
     */
    $scope.isCurrentUser = function() {
      return $scope.object._id === $rootScope.currentUser._id;
    };

    /**
     * Existing membership to manipulate.
     *
     * @var Object
     */
    $scope.membership = Memberships.findOne({
      userId: object._id
    });

    var inArr = function(arr) {
      return arr && !!_.find(arr, function(obj) {
        return obj._id === $scope.object._id;
      });
    };

    var isOwner = function(doc) {
      return doc.owner._id === $scope.object._id;
    }

    /**
     * Transform function which takes a document and aggregates the user's permissions
     * into a user-friendly string paired with a transient `permission` key.
     *
     * @param doc Object
     * @return Object
     */
    var transformDoc = function(doc) {
      if (isOwner(doc)) {
        doc.permission = "Owner";
      } else {
        var permissions = []
        if (doc.allowEditByAll || inArr(doc.editors)) {
          permissions.push("Editor");
        } else if (doc.allowReadByAll || inArr(doc.readers)) {
          permissions.push("Reader");
        }
        if (inArr(doc.approvers)) {
          permissions.push("Approver");
        } else if (inArr(doc.signers)) {
          permissions.push("Signer");
        }
        if (permissions.length === 0) {
          doc.permission = "No Access";
        } else {
          doc.permission = permissions.join(" & ");
        }
      }
      return doc;
    };

    /**
     * Local docwiki collection - all documents and the access levels
     * that the user in question has for them.
     *
     * @var AngularMeteorCollection
     */
    $scope.docs = $scope.$meteorCollection(function() {
      return Modules.find({
        inTrash: false,
        isArchived: false,
        isTemplate: false
      }, {
        transform: transformDoc
      });
    }, false);

    /**
     * @protected
     * @override
     */
    $scope.save = function() {
      $scope.loading = true;
      var payload = createPayload();
      users.save(payload).then(function() {
        return $scope.memberships.save($scope.membership);
      }).then($scope.success, $scope.failure);
    };

    /**
     * Sends reset password email to the user.
     */
    $scope.changePassword = function() {
      $scope.loading = true;
      $meteor.call('resetUserPassword', $scope.object._id).then(function() {
        growl.info('A password reset email has been sent to this user.');
        $scope.success();
      }, $scope.failure);
    };

    /**
     * Set the id of a membership that the user's resources are transferred to on
     * delete.
     *
     * @param id
     */
    $scope.setDstId = function(id) {
      if (id === $scope.dstMemId) {
        $scope.dstMemId = null;
      } else {
        $scope.dstMemId = id;
      }
    };

    /**
     * Processes the delete operation under the correct conditions.
     *
     * @note Might be nice to decouple this redirect-on-delete logic from
     * the edit user card.
     * @private
     */
    var deleteMem = function() {
      $scope.loading = true;
      $meteor.mtCall('deleteMembership', $scope.membership._id, $scope.dstMemId).then(function() {
        if ($scope.isCurrentUser()) {
          growl.info('You have been deleted from this organisation.');
          $modalInstance.result.then(function() {
            $state.go('welcome');
          });
          $modalInstance.close();
        } else {
          growl.info('User deleted from organisation and resources transferred.');
          $scope.success('delete');
        }
      }, $scope.failure);
    };

    /**
     * Toggles out `deleting` flag and resets the `dstMemId` appropriately.
     *
     * @private
     */
    var toggleDeleting = function() {
      if ($scope.deleting) {
        $scope.deleting = false;
        $scope.dstMemId = null;
      } else {
        $scope.deleting = true;
      }
    };

    /**
     * Maps the state of the deleting operation to a string to render as the
     * button title.
     *
     * @return String
     */
    $scope.deleteButtonTitle = function() {
      if ($scope.deleting) {
        if ($scope.dstMemId) {
          return "Confirm";
        } else {
          return "Cancel";
        }
      } else {
        return "Delete User";
      }
    };

    /**
     * Top-level handler for the delete operation.
     */
    $scope.handleDelete = function() {
      if ($scope.deleting && $scope.dstMemId) {
        deleteMem();
      }
      toggleDeleting();
    };

    /**
     * Transform the object such that the email key exists for editing
     * directily in the object.
     *
     * @see createPayload
     */
    $scope.object.email = $scope.object.emails[0].address;

  }

}
