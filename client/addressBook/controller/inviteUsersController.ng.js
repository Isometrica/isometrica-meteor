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
    emails: []
  };

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  $scope.addInvitation = function() {
    $scope.invitationSet.emails.push({ email: "" });
    return this;
  };

  $scope.emailsEmpty = function() {
    return _.every($scope.invitationSet.emails, function(obj) {
      return obj.email.trim() === "";
    });
  };

  $scope.addInvitation()
    .addInvitation()
    .addInvitation();

  $scope.inviteUsers = function() {

  };

}
