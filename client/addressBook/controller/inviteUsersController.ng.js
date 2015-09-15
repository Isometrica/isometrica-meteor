'use strict';

angular
  .module('isa.addressbook')
  .controller('AddressBookInviteUsersController', AddressBookInviteUsersController);

/**
 * @author Steve Fortune
 */
function AddressBookInviteUsersController($scope, $modalInstance, $meteor, growl) {

  /**
   * Begins with 3 empty invitation emails.
   *
   * @var Object
   */
  $scope.invitationSet = {
    welcomeMessage:
      "Hi there. We will be using Isometrica to store documents, " +
      "complete worksheets and track issues during this project.",
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

  $scope.$watch(function() {
    var lastEmail = _.last($scope.invitationSet.emails);
    return lastEmail.email && lastEmail.email.trim() !== ""
  }, function(newValue) {
    if (newValue) {
      $scope.addInvitation();
    }
  });

  $scope.inviteUsers = function() {
    $scope.loading = true;
    $meteor.mtCall('inviteUsers', $scope.invitationSet).then(function() {
      growl.info("Users invited.");
      $scope.cancel();
      $scope.loading = false;
    }, function() {
      growl.error("Failed to invite users");
      $scope.loading = false;
    });
  };

}
