'use strict';

angular
	.module('isa.addressbook')
	.config(isaOrgAttribute);

function isaOrgAttribute(formlyConfigProvider) {
  formlyConfigProvider.setType({
    name: 'isaOrgAttribute',
    templateUrl: 'client/addressBook/form/isaSelectOrgOpt.ng.html',
    wrapper: [ 'hzLabel', 'bootstrapHasError' ],
    controller: function($scope, $rootScope) {
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
  });
}
