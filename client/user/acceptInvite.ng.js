'use strict';

angular
  .module('isa.user')
  .controller('AcceptInviteController', AcceptInviteController);

function AcceptInviteController($scope, $meteor, $state, $stateParams, growl) {

  var handleUpdate = function(error) {
    if (error) {
      growl.error("Failed to accept membership.", error);
      $scope.loading = false;
    } else {
      $state.go('overview');
    }
    $scope.loading = false;
  };

  $scope.accept = function() {
    $scope.loading = true;
    membership.isAccepted = true;
    membership.save().then(function() {
      console.log("Done!", arguments);
    });
    Memberships.update($stateParams.membershipId, {
      $set: {
        isAccepted: true
      }
    }, {}, handleUpdate);
  };

}
