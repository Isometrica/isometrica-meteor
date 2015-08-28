'use strict';

angular
	.module('isa.form.types')
  .config(isaOrgAttribute)
  .controller('isaOrgAttributeController', isaOrgAttributeController);

function isaOrgAttributeController($scope, $rootScope) {

  var organisation = $scope.$meteorObject(Organisations, $rootScope.currentOrg._id);
  var orgOptKey = $scope.to.orgOptionKey;
  var opts = function() {
    return organisation[orgOptKey];
  };

  if (!(opts() && angular.isArray(opts()))) {
    throw new Error("orgOptionKey should be paired with an array value");
  }

  $scope.save = function() {
    var sel = {};
    sel[orgOptKey] = $scope.model[$scope.options.key];
    Organisations.update(organisation._id, {
      $push: sel
    });
    $scope.newOpt = false;
  };

  $scope.opts = opts;

}

function isaOrgAttribute(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaOrgAttribute',
    templateUrl: 'client/form/types/isaOrgAttribute.ng.html',
    wrapper: [ 'hzLabel', 'bootstrapHasError' ],
    controller: 'isaOrgAttributeController'
  });
}
