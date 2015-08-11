'use strict';

angular
  .module('isa.account')
  .controller('AccountController', AccountController);

/**
 * Given that { userId } is a candidate key for AccountSubscriptions,
 * and that only AccountSubscriptions are published for the current
 * user, we can safely assume that the AccountSubscriptions collection
 * with either contain the 1 document associated with a user or no
 * documents.
 *
 * @author Steve Fortune
 */
function AccountController($scope, $stateParams, growl) {

  $scope.account = $scope.$meteorObject(AccountSubscriptions, {}, false);
  $scope.owningModules = $scope.$meteorCollection(function() {
    return Modules.find({
      $and: [{ inTrash: false }, { isArchived: false }]
    });
  }, false).subscribe("ownedOrganisations");
  $scope.$meteorSubscribe("modules");

  if (!$scope.account.billingDetails) {
    $scope.account.billingDetails = {};
  }

  var success = function() {
    growl.success("Subscription details updated");
    $scope.loading = false;
  };

  var failure = function(err) {
    growl.error(err.message);
    $scope.loading = false;
  };

  $scope.save = function() {
    $scope.loading = true;
    console.log($scope.account);
    $scope.account.save().then(success, failure);
  };

}
