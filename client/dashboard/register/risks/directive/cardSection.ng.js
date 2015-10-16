angular
  .module('isa.dashboard.risks')
  .directive('isaCardSection', isaCardSectionDirective);

function isaCardSectionDirective(stripSpacesFilter) {
  return {
    templateUrl: 'client/dashboard/register/risks/view/cardSection.ng.html',
    transclude: true,
    replace: true,
    link: function(scope) {
      scope.sectionId = scope.sectionId || stripSpacesFilter(scope.title);
    },
    scope: {
      title: '@',
      small: '@',
      sectionId: '@',
      titleTemplate: '@'
    }
  }
}
