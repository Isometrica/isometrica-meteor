angular
  .module('isa.dashboard.meetings')
  .service('MeetingsService', meetingsService);

function meetingsService($meteor, $q, $log) {
  var _meetings = $meteor.collection(Meetings, false).subscribe('meetings-rel');
  var _orgSettings = $meteor.collection(OrganisationSettings, false).subscribe('organisationSettings');

  return {
    getMeetingTypeNames: getMeetingTypeNames,
    addMeetingType: addMeetingType,
    allMeetingActions: allMeetingActions,
    findPreviousMeeting: findPreviousMeeting,
    findPreviousMeetingActions: findPreviousMeetingActions,
    findLatestMeeting: findLatestMeeting,
    fetchPreviousMeetingItems: fetchPreviousMeetingItems
  };

  function getMeetingTypeNames() {
    var orgSettings = OrganisationSettings.findOne({_orgId: MultiTenancy.orgId()});
    if (!orgSettings || !orgSettings.meetingTypes || !orgSettings.meetingTypes.length) {
      $log.warn("No meeting types in organization settings for orgId: " + MultiTenancy.orgId());
      return [];
    }

    return orgSettings.meetingTypes;
  }

  function addMeetingType(typeName) {
    var orgSettings = OrganisationSettings.findOne({_orgId: MultiTenancy.orgId()});
    if (!orgSettings) {
      OrganisationSettings.insert({ meetingTypes: [ typeName ]});
    }
    else {
      OrganisationSettings.update(orgSettings._id, { $push: { meetingTypes: typeName }});
    }
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
    var cursor = MeetingActions.find({
      $or: [
        {
            meetingId: meeting._id,
            inTrash: false
        },
        {
          meetingType: prevMeeting.type,
          inTrash: false,
          meetingId: {$in: allPreviousIds},
          $or: [
            {'status.value': 'open'},
            {'status.value': 'needsPlan'},
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
    var cursor = MeetingActions.find({
      meetingType: prevMeeting.type,
      inTrash: false,
      meetingId: {$in: allPreviousIds},
      $or: [
        {'status.value': 'open'},
        {'status.value': 'needsPlan'},
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

  function findLatestMeeting(typeName) {
    var answer = Meetings.findOne({type: typeName, date: {$lt: new Date()}}, {sort: [['date', 'desc']]});
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
