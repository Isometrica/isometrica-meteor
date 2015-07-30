angular
  .module('isa.dashboard.meetings', [])
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
        filter: function($stateParams) { return $stateParams.filter || 'all'; },
        _meetingsSub: function($stateParams, $meteor) {
          return $meteor.subscribe('meetings');
        },
        meetings: function($meteor, _meetingsSub) {
          return $meteor.collection(function() {
            return Meetings.find({}, { sort: ["date"] });
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
        meeting: function(meetings, $stateParams) {
          return _.findWhere(meetings, { _id: $stateParams.mtgId });
        }
      }
    });
}
