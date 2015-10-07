angular
  .module('isa.dashboard.calendar')
  .directive('isaDateRangeBlock', isaDateRangeBlockDirective)
  .directive('isaMilestoneBlock', isaMilestoneBlockDirective);

function isaDateRangeBlockDirective() {
  return {
    templateUrl: 'client/dashboard/calendar/view/dateRangeBlock.ng.html',
    scope: {
      event: '='
    },
    replace: true,
    link: function(scope, elm, attr) {
      var event = scope.event;
      if (event.indxLength <= 10) {
        scope.position = event.startIndx > event.endIndxLength ? 'left' : 'right';
      } else {
        scope.position = 'middle';
      }
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
