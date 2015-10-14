angular
  .module('isa.dashboard.meetings')
  .directive('isaAttendee', attendeeDirective);

function attendeeDirective() {
  return {
    templateUrl: 'client/dashboard/meetings/isaAttendee.ng.html',
    scope: {
      attendee: '=',
      save: '&',
      remove: '&',
      isOpen: '='
    }
  }
}
