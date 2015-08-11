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

  // Workarounds ahead ! There are some edge cases with the schema
  // directive. 2 parallel forms which both mutate sub-documents
  // of an AngularMeteorObject doesn't work as expected.

  var account = $scope.$meteorObject(AccountSubscriptions, {}, false);
  $scope.account = angular.copy(account.getRawObject());
  $scope.owningModules = $scope.$meteorCollection(function() {
    return Modules.find({
      $and: [{ inTrash: false }, { isArchived: false }]
    });
  }, false).subscribe("ownedOrganisations");
  $scope.$meteorSubscribe("modules");

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
    _.extend(account, $scope.account);
    console.log(account);
    account.save().then(success, failure);
  };

}
