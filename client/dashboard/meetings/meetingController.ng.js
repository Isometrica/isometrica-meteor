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

function meetingController(meeting, attendees, agendaItems, actionItems, $modal, $state, $scope, MeetingsService, meetingActionDialog) {
  var vm = this;

  vm.meeting = meeting;
  vm.attendees = attendees;
  vm.agendaItems = agendaItems;
  vm.actionItems = actionItems;
  vm.edit = editMeeting;
  vm.restore = restoreMeeting;
  vm.openAction = function(actionId) {
    meetingActionDialog(actionId);
  };

  vm.previousActionItems = MeetingsService.findPreviousMeetingActions(vm.meeting, $scope);

  vm.actionClass = function (action) {
    if (!action.status || !action.targetDate) {
      return '';
    }

    if (action.status.value === 'canceled') {
      return 'text-info';
    }
    if (action.status.value === 'closed') {
      return 'text-success';
    }
    else if (action.status.value === 'needsPlan' || moment(action.targetDate).isBefore(new Date())) {
      return 'text-danger';
    }
    else {
      return 'text-warning';
    }
  };

  function restoreMeeting() {
    Meetings.update(meeting._id, { $set: { inTrash: false } });
    $scope.$root.$broadcast('isaMeetingSaved', meeting._id);
  }

  function editMeeting() {
    var modalInstance = $modal.open({
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

    modalInstance.result.then(function(result) {
      if ('delete' == result.reason) {
        $state.go('meetings');
      }
    })
  }
}
