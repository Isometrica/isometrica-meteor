'use strict';

angular
  .module('isa.user')
  .controller('EnrollController', EnrollController);

function EnrollController($scope, $rootScope, $state, $stateParams, $meteor, growl) {

  $scope.user = {};

  var handleErr = function(err) {
    console.log('Error handler', arguments);
    if (err) {
      growl.error("There was an error handling your request: " + err.message);
    }
  };

  var handleReset = function(err) {
    if (err) {
      handleErr(err);
    } else {
      $meteor.waitForUser().then(function(user) {
        Meteor.users.update(user._id, {
          $set: {
            'profile.fullName': $scope.user.fullName
          }
        }, handleErr);
      }, handleErr);
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
