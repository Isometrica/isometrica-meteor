angular
  .module('isa.dashboard.meetings')
  .directive('isaAgendaItem', agendaItemDirective);

function agendaItemDirective() {
  return {
    templateUrl: 'client/dashboard/meetings/isaAgendaItem.ng.html',
    scope: {
      agenda: '=',
      save: '&',
      remove: '&',
      isOpen: '='
    }
  }
}
