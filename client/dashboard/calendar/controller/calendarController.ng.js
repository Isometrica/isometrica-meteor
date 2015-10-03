'use strict';

angular
  .module('isa.dashboard.calendar')
  .controller('CalendarController', CalendarController);

/**
 * Main controller for the dashboard calendar.
 *
 * @author Steve Fortune
 */
function CalendarController($scope, $modal) {

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

  $scope.addEvent = function() {
    $modal.open({
      windowClass: 'isometrica-addressbook-edit-modal',
      templateUrl: 'client/dashboard/calendar/view/event.ng.html',
      controller : 'CalendarEventController',
      resolve: {
        object: angular.noop
      }
    });
  };

  /**
   * Given the selectState, how many collumns should the event in question
   * take up?
   *
   * @param event
   * @return Number
   */
  $scope.duration = function(event) {
    return 3;
  };

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
            return CalendarEvents.find({
              managementProgram: type,
              topic: subsection
            }, {
              sort: {
                startAt: 1
              }
            });
          })
        };
      })
    };
  });

}
