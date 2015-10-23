angular
  .module('isa.dashboard', [
    'isa.form',

    'isa.dashboard.components',

    'isa.dashboard.meetings',
    'isa.dashboard.calendar',
    'isa.dashboard.risks'
  ])
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
    replace: true,
    transclude: true,
    scope: {
      icon: '@',
      title: '@'
    }
  }
}
