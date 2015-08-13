angular
  .module('isa.dashboard.meetings')
  .controller('MeetingController', meetingController);

function meetingController(meeting, attendees, agendaItems, actionItems, $modal) {
  var vm = this;

  vm.meeting = meeting;
  vm.attendees = attendees;
  vm.agendaItems = agendaItems;
  vm.actionItems = actionItems;
  vm.edit = editMeeting;

  vm.actionClass = function (action) {
    if (action.status === 'closed') {
      return 'text-success';
    }
    else if (!action.targetDate) {
      return '';
    }
    else if (moment(action.targetDate).isBefore(new Date())) {
      return 'text-danger';
    }
    else {
      return 'text-warning';
    }
  };

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
        },
        agendaItems: function() {
          return agendaItems;
        },
        actionItems: function() {
          return actionItems;
        }
      }
    });
  }
}
