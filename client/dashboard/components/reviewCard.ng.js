angular
  .module('isa.dashboard.components')
  .directive('isaSubcardReview', isaSubcardReviewDirective);

function isaSubcardReviewDirective() {
  return {
    templateUrl: 'client/dashboard/components/reviewCard.ng.html',
    scope: {
      model: '=',
      fields: '@',
      statusField: '='
    },
    replace: true,
    require: '?^schema',
    link: function(scope, elem, attr, schemaCtrl) {
      if (!attr.model && schemaCtrl) {
        scope.model = schemaCtrl.$schemaDoc;
      }
    }
  }
}
