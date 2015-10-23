angular
  .module('isa.dashboard.components')
  .directive('isaSubcardNotes', isaSubcardNotesDirective);

function isaSubcardNotesDirective() {
  return {
    templateUrl: 'client/dashboard/components/notesCard.ng.html',
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
        scope.fields = 'notes';
      }
    }
  }
}
