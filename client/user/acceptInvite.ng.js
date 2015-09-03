'use strict';

angular
	.module('isa.user')
	.controller('AcceptInviteController', AcceptInviteController);

function AcceptInviteController($scope, $meteor,$state, $stateParams, growl) {

  $scope.membership = $scope.$meteorObject(Memberships, $stateParams.membershipId);

  var success = function() {
    $state.go('overview', { orgId: $scope.memberships._orgId });
  };
  var failure = function() {
    growl.error("Failed to accept membership");
    $scope.loading = false;
  };

	$scope.accept = function() {
		$scope.loading = true;
    $scope.membership.isAccepted = true;
    $scope.membership.save().then(success, failure);
	};

}
