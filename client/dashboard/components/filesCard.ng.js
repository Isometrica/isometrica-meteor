angular
  .module('isa.dashboard.components')
  .directive('isaSubcardFiles', isaSubcardFilesDirective);

function isaSubcardFilesDirective() {
  return {
    templateUrl: 'client/dashboard/components/filesCard.ng.html',
    scope: {
      model: '=',
      fields: '@'
    },
    replace: true,
    require: '?^schema',
    link: function(scope, elem, attr, schemaCtrl) {
      if (!attr.model && schemaCtrl) {
        scope.model = schemaCtrl.$schemaDoc;
      }
      if (!attr.fields) {
        scope.fields = 'files';
      }
    }
  }
}
