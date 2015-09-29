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
      $scope.progressAmt = function() {
        var doneAmt = $scope.org.setupDone ? $scope.org.setupDone.length : 0;
        var val = (doneAmt / 12.0) * 100.0;
        return val + '%';
      }
    }
  };
}
