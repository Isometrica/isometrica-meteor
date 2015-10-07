angular
  .module('isa.dashboard.calendar')
  .directive('isaEventDescription', isaEventDescriptionDirective);

function isaEventDescriptionDirective() {
  return {
    templateUrl: 'client/dashboard/calendar/view/eventDescription.ng.html',
    scope: {
      event: '='
    },
    replace: true
  }
}
