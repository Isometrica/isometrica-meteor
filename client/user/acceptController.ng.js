'use strict';

angular
  .module('isa.user')
  .controller('AcceptController', AcceptController);

function AcceptController($scope, membership, $meteor, growl, $state) {

  $scope.accept = function() {
    $meteor.call('acceptMembership', membership._id).then(function() {
      $state.go('overview');
    }, function() {
      growl.error("There was an error handling your request: " + err.message);
    });
  };

}
