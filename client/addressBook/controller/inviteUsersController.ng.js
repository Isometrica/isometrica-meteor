'use strict';

angular
  .module('isa.addressbook')
  .controller('AddressBookInviteUsersController', AddressBookInviteUsersController);

/**
 * @author Steve Fortune
 */
function AddressBookInviteUsersController($scope, $modalInstance) {

  /**
   * @var Object
   */
  $scope.invitationSet = {
    welcomeMessage: "",
    invitations: []
  };

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  $scope.addInvitation = function() {
    $scope.invitationSet.invitations.push("");
  };

  $scope.inviteUsers = function() {

  };

}
