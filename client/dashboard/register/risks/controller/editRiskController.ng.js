'use strict';

angular
  .module('isa.dashboard.risks')
  .controller('EditRiskController', EditRiskController);

/**
 * @author  Steve Fortune
 */
function EditRiskController($scope, $modalInstance, $controller, object) {

  $controller('AddressBookEditController', {
    $scope: $scope,
    $modalInstance: $modalInstance,
    collection: $scope.$meteorCollection(Risks),
    object: object
  });

  if ($scope.isNew) {
    Schemas.Risk.clean($scope.object);
  }

}
