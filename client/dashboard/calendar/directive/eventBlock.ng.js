angular
  .module('isa.dashboard.calendar')
  .directive('isaDateRangeBlock', isaDateRangeBlockDirective)
  .directive('isaMilestoneBlock', isaMilestoneBlockDirective);

/**
 * Directives that deal with rendering different types of events.
 * There are some special layout rules that should be Considered
 * for each type of event - these directives handle that for you.
 *
 * @note Depends on the events being transformed by the
 * `CalendarController` controller.
 * @see CalendarController.eventTransform
 * @author Steve Fortune
 */

function isaDateRangeBlockDirective() {
  return {
    templateUrl: 'client/dashboard/calendar/view/dateRangeBlock.ng.html',
    scope: {
      event: '='
    },
    replace: true,
    link: function(scope, elm, attr) {
      var event = scope.event;
      scope.$watch(function() { return event.length; }, function() {
        if (event.length <= 10) {
          scope.position = event.startPos > event.endLength ? 'left' : 'right';
        } else {
          scope.position = 'middle';
        }
      })
    }
  }
}

function isaMilestoneBlockDirective() {
  return {
    templateUrl: 'client/dashboard/calendar/view/milestoneBlock.ng.html',
    scope: {
      event: '='
    },
    replace: true
  }
}
