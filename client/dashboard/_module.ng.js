angular
  .module('isa.dashboard', [])
  .directive('isaDashboardHeader', dashboardHeader)
  .directive('isaDashboardGuidance', dashboardGuidance)
  .directive('isaDashboardItem', dashboardItem);

function dashboardHeader() {
  return {
    templateUrl: 'client/dashboard/header.ng.html'
  }
}

function dashboardGuidance() {
  return {
    templateUrl: 'client/dashboard/guidanceBar.ng.html'
  }
}

function dashboardItem() {
  return {
    templateUrl: 'client/dashboard/dashboardItem.ng.html',
    transclude: true,
    scope: {
      icon: '@',
      title: '@'
    }
  }
}
