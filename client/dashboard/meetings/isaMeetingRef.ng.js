angular
  .module('isa.dashboard.meetings')
  .directive('isaMeetingRef', isaMeetingRefDirective);

function isaMeetingRefDirective() {
  return {
    template: '<a ui-sref="meetings.meeting({mtgId: view.meeting._id})" class="btn btn-default"> \
               <strong>{{view.meeting.date | isaDate}}</strong> {{view.meeting.type}} meeting</a>',
    scope: {
      meetingId: '@'
    },
    controller: function($scope, $subs) {
      $subs.needBind($scope, 'meeting', $scope.meetingId);
      $scope.view = {
        meeting: $scope.$meteorObject(Meetings, $scope.meetingId, false)
      }
    }
  }
}
