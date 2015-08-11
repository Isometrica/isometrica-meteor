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

  var accounts = $scope.$meteorCollection(AccountSubscriptions);
  $scope.isNew = !accounts.length;

  if ($scope.isNew) {
    growl.info("You have not created a subscription yet. Enter the information below.");
  }

  // Note that 2 parallel forms which both mutate sub-documents
  // of an AngularMeteorObject doesn't work as expected.

  var account = AccountSubscriptions.findOne({}) || {};
  if (!account.billingDetails) {
    account.billingDetails = {};
  }

  $scope.account = account;
  $scope.owningModules = $scope.$meteorCollection(function() {
    return Modules.find({
      $and: [{ inTrash: false }, { isArchived: false }]
    });
  }, false).subscribe("accountModules");
  $scope.$meteorSubscribe("modules");

  var success = function() {
    growl.success("Subscription details " + ($scope.isNew ? "created" : "updated"));
    $scope.isNew = false;
    $scope.loading = false;
  };

  var failure = function(err) {
    growl.error(err.message);
    $scope.loading = false;
  };

  $scope.save = function() {
    $scope.loading = true;
    _.extend(account, $scope.account);
    accounts.save(account).then(success, failure);
  };

}
