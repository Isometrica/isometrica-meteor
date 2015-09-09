angular
  .module('isa.actions.meeting')
  .directive('isaMeetingActionView', meetingActionViewDirective);

function meetingActionViewDirective() {
  return {
    templateUrl: 'client/actions/meeting/meetingActionView.ng.html',
    controller: function($scope, meetingActions) {
      var vm = this;
      vm.action = $scope.action;
      vm.meeting = $scope.$meteorObject(Meetings, vm.action.meetingId, false).subscribe('meeting', vm.action.meetingId);
      vm.edit = meetingActions.editAction
    },
    controllerAs: 'vm',
    scope: {
      action: '='
    }
  };
}
