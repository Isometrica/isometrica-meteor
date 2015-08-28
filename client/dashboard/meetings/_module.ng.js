angular
  .module('isa.dashboard.meetings', ['ui.select'])
  .directive('isaMeetingsHeader', meetingsHeader)
  .directive('isaMeetingsGuidance', meetingsGuidance)
  .config(configureRoutes);

function meetingsHeader() {
  return {
    templateUrl: 'client/dashboard/meetings/header.ng.html'
  }
}

function meetingsGuidance() {
  return {
    templateUrl: 'client/dashboard/meetings/guidanceBar.ng.html'
  }
}

function configureRoutes($stateProvider) {
  $stateProvider
    .state('meetings', {
      url: '/meetings?filter',
      parent: 'organisation',
      templateUrl: 'client/dashboard/meetings/meetingsView.ng.html',
      controller: 'MeetingsController',
      controllerAs: 'vm',
      resolve: {
        filter: function($stateParams) { return $stateParams.filter || 'recent'; },
        _meetingsSub: function($stateParams, $meteor) {
          return $meteor.subscribe('meetings-rel');
        },
        meetings: function($meteor, _meetingsSub) {
          return $meteor.collection(function() {
            return Meetings.find({}, { sort: [[ 'date', 'desc' ]] });
          });
        }
      },
      onExit: function(_meetingsSub) {
        _meetingsSub.stop();
      }
    })
    .state('meetings.meeting', {
      url: '/:mtgId',
      templateUrl: 'client/dashboard/meetings/meetingView.ng.html',
      controller: 'MeetingController',
      controllerAs: 'vm',
      resolve: {
        _detailsSub: function($stateParams, $meteor) {
          return { stop: angular.noop };// $meteor.subscribe('meeting-details', $stateParams.mtgId);
        },
        meeting: function(meetings, $stateParams) {
          return _.findWhere(meetings, { _id: $stateParams.mtgId });
        },
        attendees: function($meteor, $stateParams, _detailsSub) {
          return $meteor.collection(function() {
            return Attendees.find({ meetingId: $stateParams.mtgId, inTrash: false });
          }, false);
        },
        agendaItems: function($meteor, $stateParams, _detailsSub) {
          return $meteor.collection(function() {
            return AgendaItems.find({ meetingId: $stateParams.mtgId, inTrash: false }, { sort: ['itemNo'] });
          }, false);
        },
        actionItems: function($meteor, $stateParams, _detailsSub) {
          return $meteor.collection(function() {
            return MeetingActions.find({ meetingId: $stateParams.mtgId, inTrash: false }, { sort: ['referenceNumber'] });
          }, false);
        }
      },
      onExit: function (_detailsSub) {
        _detailsSub.stop();
      }
    });
}
