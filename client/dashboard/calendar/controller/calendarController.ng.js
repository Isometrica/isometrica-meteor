'use strict';

angular
  .module('isa.dashboard.calendar')
  .controller('CalendarController', CalendarController);

/**
 * Main controller for the dashboard calendar.
 *
 * @author Steve Fortune
 */
function CalendarController($scope, $modal, $state, $stateParams, $rootScope) {

  $scope.openDialog = function(event) {
    $modal.open({
      windowClass: 'isometrica-addressbook-edit-modal',
      templateUrl: 'client/dashboard/calendar/view/event.ng.html',
      controller : 'CalendarEventController',
      resolve: {
        object: function() { return event; },
        startAt: function() { return $scope.startAt; }
      }
    });
  };

  $scope.selectFilter = function(title) {
    $state.go('calendar', {
      filter: title.toLowerCase(),
      startAt: $stateParams.startAt
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
    var end = intervalPer(Math.max(Math.ceil(dateInterval(ev.endAt)), 1));
    ev.length = (end - ev.startPos);
    ev.endLength = (100 - end);
    return ev;
  };

  var intervalMap = {
    year: 12,
    quarter: 13
  };

  $scope.filter = $stateParams.filter;

  $scope.precision = intervalMap[$scope.filter];

  $scope.startAt = new Date($stateParams.startAt).normalize($scope.filter);

  $scope.endAt = $scope.startAt.from($scope.filter);

  $scope.previousAt = $scope.startAt.from($scope.filter, true);

  var totalInterval = $scope.endAt.getTime() - $scope.startAt.getTime();

  var blockInterval = totalInterval/$scope.precision;

  $scope.isQuarterly = function() {
    return $scope.filter === 'quarter';
  };

  $scope.monthCol = function(at) {
    if ($scope.isQuarterly()) {
      return at < 2 ? 4 : 5;
    } else {
      return 1;
    }
  };

  $scope.months = function() {
    var date = new Date($scope.startAt), epochs = [];
    while (date.getTime() < $scope.endAt.getTime()) {
      epochs.push(date.getTime());
      date.setMonth(date.getMonth() + 1);
    }
    return epochs;
  };

  $scope.weeks = function() {
    return _.map(_.range(1, 14), function(n) { return n > 1 ? n : 'Week ' + n; });
  };

  var dateInterval = function(d) {
    return (d.getTime() - $scope.startAt.getTime())/blockInterval;
  };

  var intervalPer = function(n) {
    n = (n/$scope.precision)*100;
    if (n < 0) {
      n = 0;
    } else if (n > 100) {
      n = 100;
    }
    return n;
  }

  var subsections = Schemas.CalendarEvent.getDefinition('topic').allowedValues;

  /**
   * Reactively build an array of objects used to model the calendar
   * sections.
   *
   * Each section object in the array is composed of a 'title' and
   * an array of sub-section objects. These subsection objects each have
   * their own 'subtitle' and 'collection' of data.
   *
   * @var Array
   */

  $scope.$meteorAutorun(function() {

    var events = CalendarEvents.findBetween($scope.startAt, $scope.endAt, {}, {
      transform: eventTransform
    }).fetch();
    var sectionTypes = _.uniq(_.map(events, function(e) { return e.managementProgram; }));

    $scope.sections = _.map(sectionTypes, function(type) {
      return {
        title: type.replace('Management', '').trim(),
        subsections: _.map(subsections, function(subsection) {
          return {
            title: subsection,
            collection: _.filter(events, function(ev) {
              return ev.managementProgram === type && ev.topic === subsection;
            })
          };
        })
      };
    });

  });

  $rootScope.$on('$subTransitionStart', function() {
    $scope.loading = true;
  });

}
