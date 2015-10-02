'use strict';

angular
  .module('isa.dashboard.calendar')
  .controller('CalendarController', CalendarController);

/**
 * Main controller for the dashboard calendar.
 *
 * @author Steve Fortune
 */
function CalendarController($scope) {

  /**
   * Array of 'section' objects. This represents that state of the calendar.
   * Each section object has a name and a collection of events.
   *
   * @var Array
   */
  $scope.sections = [
    {
      name: 'Quality',
      //collection: $scope.$meteorCollection('calendarEvents')
    }
  ];

}
