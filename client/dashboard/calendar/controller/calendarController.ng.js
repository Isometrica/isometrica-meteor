'use strict';

angular
  .module('isa.dashboard.calendar')
  .controller('CalendarController', CalendarController);

/**
 * Main controller for the dashboard calendar.
 *
 * @author Steve Fortune
 */
function CalendarController($scope, $modal, $state, $stateParams, $timeout) {

  $scope.$on('$subTransitionStart', function() {
    $scope.loading = true;
  });

  var sectionTypes = [ 'Quality Management' ];
  var subsections = [
    'Awareness',
    'Training',
    'Customer Survey',
    'Supplier Survey',
    'Internal Audit',
    'External Audit',
    'Management Review'
  ];

  $scope.openDialog = function(event) {
    $modal.open({
      windowClass: 'isometrica-addressbook-edit-modal',
      templateUrl: 'client/dashboard/calendar/view/event.ng.html',
      controller : 'CalendarEventController',
      resolve: {
        object: function() { return event; }
      }
    });
  };

  $scope.selectFilter = function(title) {
    $state.go('calendar', {
      filter: title.toLowerCase()
    });
  };

  /**
   * Calculates the average position of the events in the table as a
   * factor of the required precision. Adds *length properties to
   * the event that describe it position as a percentage of the
   * timeline displayed in the calendar.
   *
   * @note To avoid infinite $digest cycles, remember to always return
   * the same object that you recieved from a transform fn.
   * @param ev  Object
   * @return Object
   */
  var eventTransform = function(ev) {
    ev.startPos = intervalPer(Math.floor(dateInterval(ev.startAt)))
    var end = intervalPer(Math.ceil(dateInterval(ev.endAt)));
    ev.length = (end - ev.startPos);
    ev.endLength = (100 - end);
    return ev;
  };

  /// @TODO Move to some global meteor config
  var intervalMap = {
    'year': 365,
    'quarter': 92
  };
  var calIntervalMap = {
    'year': 12,
    'quarter': 4
  };

  $scope.filter = $stateParams.filter;

  $scope.calIntervals = function() {
    return _.range(calStartAt.getTime(), calEndAt.getTime(), intervalLength);
  };

  var calStartAt = $stateParams.startAt ? new Date($stateParams.startAt) : new Date(),
      calEndAt = new Date(calStartAt),
      intervalPrecision = calIntervalMap[$scope.filter];

  calEndAt.setDate(calStartAt.getDate() + intervalMap[$scope.filter]);
  var calInterval = calEndAt.getTime() - calStartAt.getTime(),
      intervalLength = calInterval/intervalPrecision;

  $scope.calStartAt = calStartAt;
  $scope.calEndAt = calEndAt;
  $scope.previousAt = new Date(calStartAt.getTime() - calInterval);

  var dateInterval = function(d) {
    return (d.getTime() - calStartAt.getTime())/intervalLength;
  };

  var intervalPer = function(n) {
    n = (n/intervalPrecision)*100;
    if (n < 0) {
      n = 0;
    } else if (n > 100) {
      n = 100;
    }
    return n;
  }

  /**
   * Build an array of objects used to model the calendar sections.
   * Each section object in the array is composed of a 'title' and
   * an array of sub-section objects. These objects each havae their
   * own 'subtitle' and 'collection' of data.
   *
   * @note Building this view-model dynamically because we don't yet
   * know whether the section / subscections are configurable in the
   * organisation setup.
   *
   * @var Array
   */
  $scope.sections = _.map(sectionTypes, function(type) {
    return {
      title: type.replace('Management', ''),
      subsections: _.map(subsections, function(subsection) {
        return {
          title: subsection,
          collection: $scope.$meteorCollection(function() {
            return CalendarEvents.findBetween(calStartAt, calEndAt, {
              managementProgram: type,
              topic: subsection
            }, { transform: eventTransform });
          })
        };
      })
    };
  });

}
