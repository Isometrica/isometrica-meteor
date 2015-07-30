angular
  .module('isa.dashboard.meetings')
  .controller('MeetingsController', meetingsController);

function meetingsController(filter, meetings, $modal) {
  var vm = this;

  vm.filter = filter;
  vm.meetings = meetings;

  vm.openMeeting = openMeeting;

  function openMeeting(meeting, isNew) {
    var modalInstance = $modal.open({
      templateUrl: 'client/dashboard/meetings/editMeeting.ng.html',
      controller: 'EditMeetingController',
      controllerAs: 'vm',
      resolve: {
        meetings: function() {
          return meetings;
        },
        meeting: function() {
          return meeting;
        },
        isNew: function() {
          return isNew;
        }
      }
    });
  }
}
