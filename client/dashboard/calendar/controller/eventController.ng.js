'use strict';

angular
.module('isa.dashboard.calendar')
  .controller('CalendarEventController', CalendarEventController);

/**
 * @extends AddressBookEditController
 * @author  Steve Fortune
 */
function CalendarEventController($scope, $modalInstance, $controller, object, startAt) {

  $controller('AddressBookEditController', {
    $scope: $scope,
    $modalInstance: $modalInstance,
    collection: $scope.$meteorCollection(CalendarEvents),
    object: object
  });

  if ($scope.isNew) {
    $scope.object.startAt = startAt;
    var dateWatcher = function() {
      Schemas.CalendarEvent.clean($scope.object);
    };
    $scope.$watch(function() { return $scope.object.startAt; }, dateWatcher);
    $scope.$watch(function() { return $scope.object.endAt; }, dateWatcher);
  }
}
