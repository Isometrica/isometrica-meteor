'use strict';

angular
	.module('isa.addressbook')
	.config(isaSelectOrgOpt);

function isaSelectOrgOpt(formlyConfigProvider) {

  formlyConfigProvider.setType({
    name: 'isaCheckbox',
    templateUrl: 'client/addressBook/form/isaCheckbox.ng.html',
    controller: function($scope, $stateParams) {
      $scope.organisation = $scope.$meteorObject(Organisations, $stateParams.orgId);
      var options = function() {
        return organisation[to.orgOptionKey];
      };
      $scope.select = function(item, model, label) {
        if (~options().indexOf(item)) {
          options().push(item);
          $scope.organisation.save();
        }
      };
      $scope.options = options;
    },
    wrapper: [ 'isaCheckboxLabel' ]
  });

}
