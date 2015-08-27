'use strict';

angular
	.module('isa.addressbook')
	.config(isaOrgAttribute);

function isaOrgAttributeController($scope, $rootScope) {
  $scope.organisation = $scope.$meteorObject(Organisations, $rootScope.currentOrg._id);
  var options = function() {
    return $scope.organisation[$scope.to.orgOptionKey];
  };
  if (!(options() && angular.isArray(options()))) {
    throw new Error("orgOptionKey should be paired with an array value");
  }
  $scope.select = function(item, model, label) {
    if (!~options().indexOf(item)) {
      options().push(item);
      $scope.organisation.save();
    }
  };
  $scope.options = options;
}
isaOrgAttributeController.$inject = [ '$scope', '$rootScope' ];

function isaOrgAttribute(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaOrgAttribute',
    templateUrl: 'client/addressBook/form/isaOrgAttribute.ng.html',
    wrapper: [ 'hzLabel', 'bootstrapHasError' ],
    controller: isaOrgAttributeController
  });
}
