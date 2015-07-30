angular
  .module('isa.dashboard.meetings')
  .controller('MeetingController', meetingController);

function meetingController(meeting, meetings, $modal) {
  var vm = this;

  vm.meeting = meeting;
  vm.edit = editMeeting;

  function editMeeting() {
    var modalInstance = $modal.open({
      templateUrl: 'client/dashboard/meetings/editMeeting.ng.html',
      controller: 'EditMeetingController',
      controllerAs: 'vm',
      resolve: {
        meetings: function() {
          return meetings;
        },
        meeting: function() {
          return vm.meeting;
        },
        isNew: function() {
          return false;
        }
      }
    });
  }
}
