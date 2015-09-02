'use strict';

angular
  .module('isa.addressbook')
  .controller('AddressBookInviteUsersController', AddressBookInviteUsersController);

/**
 * @author Steve Fortune
 */
function AddressBookInviteUsersController($scope, $modalInstance) {

  /**
   * Begins with 3 empty invitation emails.
   *
   * @var Object
   */
  $scope.invitationSet = {
    welcomeMessage: "",
    emails: [ "", "", "", ]
  };

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  $scope.addInvitation = function() {
    $scope.invitationSet.emails.push("");
  };

  $scope.inviteUsers = function() {

  };

}
