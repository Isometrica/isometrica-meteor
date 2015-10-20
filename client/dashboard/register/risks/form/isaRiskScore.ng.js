'use strict';

angular
	.module('isa.dashboard.risks')
	.config(isaRiskSoreType)
  .controller('isaRiskScoreController', isaRiskScoreController);

function isaRiskScoreController($scope) {
  $scope.mtrx = [
    [45, 65, 91, 95, 100],
    [35, 60, 75, 80, 85],
    [26, 51, 54, 59, 66],
    [15, 25, 30, 36, 42],
    [1, 8, 12, 16, 20]
  ];
  $scope.colLabels = [ 'Catastrophic', 'Significant', 'Moderate', 'Minor', 'Limited' ];
  $scope.rowLabels = [ 'V.Low', 'Low', 'Med', 'High', 'V.High' ];
}

function isaRiskSoreType(formlyConfigProvider) {

  formlyConfigProvider.setType({
    name: 'isaRiskScore',
    templateUrl: 'client/dashboard/register/risks/form/isaRiskScore.ng.html',
    controller: 'isaRiskScoreController'
  });

}
