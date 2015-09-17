'use strict';

angular
  .module('isa.user')
  .controller('EnrollController', EnrollController);

function EnrollController($scope, $rootScope, $state, $stateParams, $meteor, growl, isaHandleErr, isaAccept) {

  $scope.$meteorSubscribe('profileImages');
  $scope.user = {};

  var acceptMembership = function() {
    isaAccept.accept().then(function() {
      $scope.loading = false;
    });
  };

  var updateProfile = function() {
    $meteor.waitForUser().then(function(user) {
      Meteor.users.update(user._id, {
        $set: {
          'profile.photo': $scope.user.photo,
          'profile.firstName': $scope.user.firstName,
          'profile.lastName': $scope.user.lastName
        }
      }, isaHandleErr(acceptMembership));
    }, isaHandleErr());
  };

  $scope.setup = function() {
    $scope.loading = true;
    Accounts.resetPassword($stateParams.token, $scope.user.password, isaHandleErr(updateProfile));
  };

}
