angular
  .module('isa.dashboard.components')
  .directive('isaSubcardCards', isaSubcardCardsDirective);

function isaSubcardCardsDirective() {
  return {
    templateUrl: 'client/dashboard/components/cardsCard.ng.html',
    transclude: true,
    replace: true,
    scope: {
      title: '@'
    }
  }
}
