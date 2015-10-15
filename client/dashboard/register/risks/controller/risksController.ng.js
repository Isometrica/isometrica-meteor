'use strict';

angular
  .module('isa.dashboard.risks')
  .controller('RisksController', RisksController);

/**
 * @author  Steve Fortune
 */
function RisksController($scope, $modal) {

  $scope.risks = $scope.$meteorCollection(Risks, {});

  $scope.openDialog = function(risk) {
    $modal.open({
      windowClass: 'isometrica-addressbook-edit-modal',
      templateUrl: 'client/dashboard/register/risks/view/editRisk.ng.html',
      controller : 'EditRiskController',
      resolve: {
        object: function() { return risk; }
      }
    });
  };

}
