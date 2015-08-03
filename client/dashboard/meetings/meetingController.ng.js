angular
  .module('isa.dashboard.meetings')
  .controller('MeetingController', meetingController);

function meetingController(meeting, attendees, $modal) {
  var vm = this;

  vm.meeting = meeting;
  vm.attendees = attendees;
  vm.edit = editMeeting;

  function editMeeting() {
    $modal.open({
      templateUrl: 'client/dashboard/meetings/editMeeting.ng.html',
      controller: 'EditMeetingController',
      controllerAs: 'vm',
      resolve: {
        meeting: function() {
          return vm.meeting;
        },
        attendees: function() {
          return attendees;
        }
      }
    });
  }
}
