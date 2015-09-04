'use strict';

angular
  .module('isa.user')
  .controller('EnrollController', EnrollController);

function EnrollController($scope, $rootScope, $state, $stateParams, growl) {

  $scope.user = {};

  var handleReset = function(err) {
    if (err) {
      growl.error("There was an error handling your request", err);
    } else {
      Meteor.users.update($rootScope.currentUser._id, {
        $set: {
          'profile.fullName': $scope.user.fullName
        }
      });
      // @TODO Redirect to memberships
    }
  };

  $scope.setup = function() {
    Accounts.resetPassword(
      $stateParams.token,
      $scope.user.password,
      handleReset
    );
  };

}
