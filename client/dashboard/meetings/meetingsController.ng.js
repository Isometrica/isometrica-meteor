angular
  .module('isa.dashboard.meetings')
  .controller('MeetingsController', meetingsController);

function meetingsController(filter, meetings, $modal, $state, $stateParams, MeetingsService, $scope) {
  var vm = this;

  vm.filter = filter;
  vm.meetings = [];
  vm.sections = [];

  vm.actionCounts = {};
  vm.getActionCount = getActionCount;
  vm.addMeeting = addMeeting;

  refreshData();
  if (!$state.params.mtgId && vm.meetings.length) {
    $state.go('.meeting', {mtgId: vm.meetings[0]._id});
  }

  $scope.$on('isaMeetingSaved', function(event, mtgId) {
    refreshData();
  });

  function refreshData() {
    vm.meetings = applyFilter(meetings);
    _.each(vm.meetings, function(mtg) {
      vm.actionCounts[mtg._id] = getActionCount(mtg);
    });
  }

  function getActionCount(mtg) {
    var own = MeetingActions.find({meetingId:mtg._id}).count();
    var other = MeetingsService.findPreviousMeetingActions(mtg).length;
    return own + other;
  }

  function applyFilter(data) {
    if ('type' === filter) {
      var tmp = {};
      var prevCollapsed = {};
      _.each(vm.sections, function(section) {
        prevCollapsed[section.type] = section.isCollapsed;
      });

      vm.sections.length = [];
      _.each(data, function(mtg) {
        if (mtg.inTrash) {
          return;
        }

        vm.actionCounts[mtg._id] = getActionCount(mtg);

        if (tmp[mtg.type]) {
          tmp[mtg.type].push(mtg);
        }
        else {
          tmp[mtg.type] = [ mtg ];
        }
      });

      _.each(tmp, function(arr) {
        arr.sort(function (a, b) { return moment(a.date).isBefore(b.date) ? 1 : moment(a.data).isAfter(b.date) ? -1 : 0});

        vm.sections.push( {
          type: arr[0].type,
          meetings: arr,
          isCollapsed: prevCollapsed.hasOwnProperty(arr[0].type) ? prevCollapsed[arr[0].type] : true
        });
      });

      vm.sections.sort(function (a, b) {return a.type.localeCompare(b.type);});

      var answer = [];
      _.each(vm.sections, function(section) {
        answer = _.union(answer, section.meetings);
      });

      return answer;
    }

    return _.filter(data, function(item) {
      if ('deleted' === filter) {
        return item.inTrash;
      }

      return !item.inTrash;
    });
  }


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
        },
        agendaItems: function() {
          return [];
        },
        actionItems: function() {
          return [];
        },
        prevActionItems: function() {
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
