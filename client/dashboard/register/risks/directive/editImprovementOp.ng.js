angular
  .module('isa.dashboard.risks')
  .directive('isaEditImprovementOp', isaEditImprovementOpDirective);

function isaEditImprovementOpDirective() {
  return {
    templateUrl: 'client/dashboard/register/risks/view/editImprovementOp.ng.html',
    scope: {
      io: '='
    }
  }
}
