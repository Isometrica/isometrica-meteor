'use strict';

angular
	.module('isa.form.types')
  .config(isaOrgAttribute)
  .controller('isaOrgAttributeController', isaOrgAttributeController);

function isaOrgAttributeController($scope, $rootScope) {

  var organisation = Organisations.findOne($rootScope.currentOrg._id);
  var orgOptKey = $scope.to.orgOptionKey;
  var opts = function() {
    return organisation[orgOptKey];
  };

  if (!(opts() && angular.isArray(opts()))) {
    throw new Error("orgOptionKey should be paired with an array value");
  }

  $scope.saveOpt = function() {
    var item = $scope.model[$scope.options.key];
    opts().push(item);
    var sel = {};
    sel[orgOptKey] = opts();
    Organisations.update(organisation._id, {
      $set: sel
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
