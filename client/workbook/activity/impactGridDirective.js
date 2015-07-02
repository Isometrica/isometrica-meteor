angular
  .module('isa.workbook.activity')
  .directive('isaImpactGrid', ImpactGridDirective)
  .controller('ImpactGridController', ImpactGridController);

function ImpactGridDirective() {
  return {
    restrict: 'E',
    templateUrl: 'client/workbook/activity/impactGrid.ng.html',
    scope: {
      title: '@',
      values: '='
    },
    controller: 'ImpactGridController'
  }
}

ImpactGridController.$inject = ['$scope', '$modal']
function ImpactGridController($scope, $modal) {
  $scope.impactClasses = [ '', 'impact-vlow', 'impact-low', 'impact-medium', 'impact-high', 'impact-vhigh' ];
  $scope.impactLabels = [ '1h', '2h', '1d', '2d', '3d', '1w', '2w', '4w' ];
  $scope.editValue = function (idx) {
    var modalInstance = $modal.open({
      templateUrl: 'client/workbook/activity/impactGrading.ng.html',
      controller: 'EditImpactGradeController',
      controllerAs: 'vm',
      resolve: {
        title: function() { return $scope.title; },
        span: function() { return ['1 hour', '2 hours', '1 day', '2 days', '3 days', '1 week', '2 weeks', '4 weeks'][idx]; }
      }
    });

    modalInstance.result.then(function(value) {
      $scope.values[idx] = value;
    })
  }
}
