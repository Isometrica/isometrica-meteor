angular
  .module('isa.dashboard')
  .directive('isaDashboardView', dashboardViewDirective);

function dashboardViewDirective() {
  return {
    templateUrl: 'client/dashboard/dashboardView.ng.html'
  }
}
