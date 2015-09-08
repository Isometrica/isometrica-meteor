'use strict';

angular
  .module('isa.user')
  .controller('EnrollController', EnrollController);

function EnrollController($scope, $rootScope, $state, $stateParams, $meteor, growl, isaHandleErr, isaAccept) {

  $scope.user = {};

  var updateProfile = function() {
    Meteor.users.update(user._id, {
      $set: {
        'profile.firstName': $scope.user.firstName,
        'profile.lastName': $scope.user.lastName
      }
    }, isaHandleErr(Accept.accept));
  };

  var enroll = function(err) {
    $meteor.waitForUser().then(updateProfile, isaHandleErr());
  };

  $scope.setup = function() {
    Accounts.resetPassword($stateParams.token, $scope.user.password, handleErr(enroll));
  };

}
