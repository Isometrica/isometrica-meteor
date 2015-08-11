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
function AccountController($scope, $stateParams) {

  $scope.account = $scope.$meteorObject(AccountSubscriptions, {}, false);
  $scope.owningModules = $scope.$meteorCollection(function() {
    return Modules.find({
      $and: [{ inTrash: false }, { isArchived: false }]
    });
  }, false).subscribe("ownedOrganisations");
  $scope.$meteorSubscribe("modules");

  var complete = function() {
    $scope.loading = false;
  };

  $scope.save = function() {
    $scope.loading = true;
    $scope.account.save().then(complete);
  };

}
