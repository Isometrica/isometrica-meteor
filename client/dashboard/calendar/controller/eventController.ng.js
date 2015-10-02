'use strict';

angular
.module('isa.dashboard.calendar')
  .controller('CalendarEventController', CalendarEventController);

/**
 * @extends AddressBookEditController
 * @author  Steve Fortune
 */
function CalendarEventController($scope, $modalInstance, $controller, object) {

  $controller('AddressBookEditController', {
    $scope: $scope,
    $modalInstance: $modalInstance,
    collection: $scope.$meteorCollection(CalendarEvents),
    object: object
  });

}
