angular
  .module('isa.dashboard.calendar')
  .directive('isaDateRangeBlock', isaDateRangeBlockDirective);

function isaDateRangeBlockDirective() {
  return {
    templateUrl: 'client/dashboard/calendar/directive/dateRangeBlock.ng.html',
    scope: {
      event: '='
    },
    replace: true,
    link: function(scope, elm, attr) {
      var event = scope.event;
      if (event.indxLength <= 10 && event.type === 'date_range') {
        scope.position = event.startIndx > event.endIndxLength ? 'left' : 'right';
      } else {
        scope.position = 'middle';
      }
    }
  }
}
