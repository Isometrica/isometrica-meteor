angular
  .module('isa.overview')
  .directive('isaOrgSetupPanel', orgSetupPanelDirective);

function orgSetupPanelDirective() {
  return {
    templateUrl: 'client/overview/orgSetupPanel.ng.html',
    restrict: 'E',
    scope: {
      org: '='
    },
    controller: function($scope) {
      $scope._orgObj = angular.isString($scope.org) ? $scope.$meteorObject(Organisations, $scope.org, false) : org;
      $scope.progressAmt = '0%';

      $scope.$watch('_orgObj.setupDone', function(newVal) {
        var doneAmt = angular.isArray(newVal) ? newVal.length : 0;
        var val = (doneAmt / 12.0) * 100.0;
        $scope.progressAmt = Math.round(val) + '%';
      });
    }
  };
}
