angular
  .module('isa.dashboard.meetings')
  .controller('MeetingsController', meetingsController);

function meetingsController(filter, meetings, $modal, $state) {
  var vm = this;

  vm.filter = filter;
  vm.meetings = meetings;

  vm.addMeeting = addMeeting;

  function addMeeting() {
    var modalInstance = $modal.open({
      templateUrl: 'client/dashboard/meetings/editMeeting.ng.html',
      controller: 'EditMeetingController',
      controllerAs: 'vm',
      resolve: {
        meeting: function() {
          return null;
        },
        attendees: function() {
          return [];
        }
      }
    });

    modalInstance.result.then(function(result) {
      if (result.reason && result.reason === 'save') {
        $state.go('meetings.meeting', { mtgId: result.meetingId });
      }
    });
  }
}
