angular
  .module('isa.dashboard.components')
  .directive('isaSubcardFields', isaSubcardFieldsDirective);

function isaSubcardFieldsDirective() {
  return {
    templateUrl: 'client/dashboard/components/fieldsCard.ng.html',
    scope: {
      title: '@',
      model: '=',
      fields: '@',
      indicator: '&'
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
