angular
  .module('isa.dashboard.risks')
  .directive('isaRiskListItem', isaRiskListItemDirective);

function isaRiskListItemDirective() {
  return {
    templateUrl: 'client/dashboard/register/risks/view/riskListItem.ng.html',
    scope: {
      risk: '='
    }
  }
}
