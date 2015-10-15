angular
  .module('isa.dashboard.risks')
  .directive('isaCardSection', isaCardSectionDirective);

function isaCardSectionDirective() {
  return {
    templateUrl: 'client/dashboard/register/risks/view/cardSection.ng.html',
    transclude: true,
    replace: true,
    scope: {
      title: '@',
      small: '@',
      titleTemplate: '@'
    }
  }
}
