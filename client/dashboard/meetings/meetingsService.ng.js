angular
  .module('isa.dashboard.meetings')
  .service('MeetingsService', meetingsService);

function meetingsService($meteor, $q, $log) {
  var _meetings = $meteor.collection(Meetings, false).subscribe('meetings-rel');

  return {
    getMeetingTypeNames: getMeetingTypeNames,
    allMeetingActions: allMeetingActions,
    findPreviousMeeting: findPreviousMeeting,
    findPreviousMeetingActions: findPreviousMeetingActions,
    findPreviousMeetingActionsByType: findPreviousMeetingActionsByType,
    fetchPreviousMeetingItems: fetchPreviousMeetingItems
  };

  function getMeetingTypeNames() {
    var orgSettings = Organisations.findOne({_id: MultiTenancy.orgId()});
    if (!orgSettings || !orgSettings.meetingTypes || !orgSettings.meetingTypes.length) {
      $log.warn("No meeting types in organization settings for orgId: " + MultiTenancy.orgId());
      return [];
    }

    return orgSettings.meetingTypes;
  }

  function allMeetingActions(meeting, scope) {
    var allPrevious = Meetings.find({
      date: {$lt: meeting.date},
      type: meeting.type,
      inTrash: false
    }, {sort: [['date', 'desc']]}).fetch();
    if (!allPrevious || !allPrevious.length) {
      return [];
    }

    var allPreviousIds = _.map(allPrevious, function(prevMtg) {
      return prevMtg._id
    });

    var prevMeeting = allPrevious[0];
    var cursor = Actions.find({
      $or: [
        {
            'meeting.meetingId': meeting._id,
            inTrash: false
        },
        {
          'meeting.meetingType': prevMeeting.type,
          'meeting.meetingId': {$in: allPreviousIds},
          inTrash: false,
          $or: [
            {'status.value': 'open'},
            {
              $and: [
                { $or: [ {'status.value': 'closed'}, {'status.value': 'canceled' } ] },
                {'status.at': {$gt: prevMeeting.date}}
              ]
            }
          ]
        }
      ]
    });

    return scope ? scope.$meteorCollection(function() {
      return cursor
    }) : cursor.fetch();
  }

  function findPreviousMeeting(meeting) {
    if (angular.isString(meeting)) {
      meeting = Meetings.findOne(meeting);
      if (!meeting) {
        return undefined;
      }
    }

    return Meetings.findOne({
      date: {$lt: meeting.date},
      type: meeting.type,
      inTrash: false
    }, {sort: [['date', 'desc']]});
  }

  function findPreviousMeetingActions(meeting, scope) {
    var allPrevious = Meetings.find({
      date: {$lt: meeting.date},
      type: meeting.type,
      inTrash: false
    }, {sort: [['date', 'desc']]}).fetch();
    if (!allPrevious || !allPrevious.length) {
      return [];
    }

    var allPreviousIds = _.map(allPrevious, function(prevMtg) {
      return prevMtg._id
    });

    var prevMeeting = allPrevious[0];
    var cursor = Actions.find({
      'meeting.meetingType': prevMeeting.type,
      'meeting.meetingId': {$in: allPreviousIds},
      inTrash: false,
      $or: [
        {'status.value': 'open'},
        {
          $and: [
            { $or: [ {'status.value': 'closed'}, {'status.value': 'canceled' } ] },
            {'status.at': {$gt: prevMeeting.date}}
          ]
        }
      ]
    });

    return scope ? scope.$meteorCollection(function() {
      return cursor
    }) : cursor.fetch();
  }

  function findPreviousMeetingActionsByType(meeting, scope) {
    var answer = {
      open: [],
      closed: []
    };

    var allPrevious = Meetings.find({
      date: {$lt: meeting.date},
      type: meeting.type,
      inTrash: false
    }, {sort: [['date', 'desc']]}).fetch();

    if (!allPrevious || !allPrevious.length) {
      return answer;
    }

    var allPreviousIds = _.map(allPrevious, function(prevMtg) {
      return prevMtg._id
    });

    var prevMeeting = allPrevious[0];
    var openCursor = Actions.find({
      'meeting.meetingType': prevMeeting.type,
      'meeting.meetingId': {$in: allPreviousIds},
      inTrash: false,
      'status.value': 'open'
    });

    var closedCursor = Actions.find({
      'meeting.meetingType': prevMeeting.type,
      'meeting.meetingId': {$in: allPreviousIds},
      inTrash: false,
      $and: [
        { $or: [ {'status.value': 'closed'}, {'status.value': 'canceled' } ] },
        {'status.at': {$gt: prevMeeting.date}}
      ]
    });

    if (scope) {
      answer.open = scope.$meteorCollection(function() { return openCursor; }, false);
      answer.closed = scope.$meteorCollection(function() { return closedCursor; }, false);
    }
    else {
      answer.open = openCursor.fetch();
      answer.closed = closedCursor.fetch();
    }

    return answer;
  }

  function findLatestMeeting(typeName) {
    var answer = Meetings.findOne({type: typeName, inTrash: false}, {sort: [['date', 'desc']]});
    return answer;
  }

  function fetchPreviousMeetingItems(typeName) {
    var answer = {
      attendees: [],
      agendaItems: []
    };

    var prevMtg = findLatestMeeting(typeName);
    if (!prevMtg) {
      return $q.when(answer);
    }

    return $meteor
      .subscribe('meeting-details', prevMtg._id)
      .then(function(subHandle) {
        answer.attendees = _.map(Attendees.find({
          meetingId: prevMtg._id,
          isRegular: true
        }).fetch(), function(val) {
          return _.pick(val, 'person', 'isRegular');
        });
        answer.agendaItems = _.map(AgendaItems.find({
          meetingId: prevMtg._id,
          isRegular: true
        }).fetch(), function(val) {
          return _.pick(val, 'itemNo', 'details', 'whoSubmitted', 'isRegular');
        });

        subHandle.stop();

        return answer;
      });
  }
}
