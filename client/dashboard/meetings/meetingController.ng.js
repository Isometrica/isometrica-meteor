angular
  .module('isa.dashboard.meetings')
  .controller('MeetingController', meetingController)
  .filter('previousActionsFor', previousActionsFilter);

function previousActionsFilter() {
  return function(data, meeting) {
    if (!angular.isArray(data)) {
      return data;
    }

    return _.filter(data, function(item) {
      // Skip actions from this meeting
      if (item.meetingId == meeting._id) {
        return false;
      }

      // Skip actions from meetings *after* this one
      var actionMtg = Meetings.findOne(item.meetingId);
      var answer = !(actionMtg && moment(actionMtg.date).isAfter(meeting.date));
      return answer;
    })
  }
}

function meetingController(meeting, attendees, agendaItems, actionItems, $modal, $scope, MeetingsService) {
  var vm = this;

  vm.meeting = meeting;
  vm.attendees = attendees;
  vm.agendaItems = agendaItems;
  vm.actionItems = actionItems;
  vm.edit = editMeeting;

  vm.previousActionItems = MeetingsService.findPreviousMeetingActions(vm.meeting, $scope);

  vm.actionClass = function (action) {
    if (!action.status || !action.targetDate) {
      return '';
    }

    if (action.status.value === 'closed') {
      return 'text-success';
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
        },
        prevActionItems: function() {
          return vm.previousActionItems;
        }
      }
    });
  }
}
