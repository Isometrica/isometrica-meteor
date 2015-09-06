'use strict';

angular
  .module('isa.user')
  .controller('EnrollController', EnrollController);

function EnrollController($scope, $rootScope, $state, $stateParams, $meteor, growl) {

  $scope.user = {};

  var handleErr = function(cb) {
    return function(err) {
      if (err) {
        growl.error("There was an error handling your request: " + err.message);
      } else if (cb) {
        cb();
      }
    }
  };

  var enroll = function(err) {
    $meteor.waitForUser().then(function(user) {
      Meteor.users.update(user._id, {
        $set: {
          'profile.firstName': $scope.user.firstName,
          'profile.lastName': $scope.user.lastName
        }
      }, handleErr(function() {
        $state.go('accept');
      }));
    }, handleErr());
  };

  $scope.setup = function() {
    Accounts.resetPassword($stateParams.token, $scope.user.password, handleErr(enroll));
  };

}
