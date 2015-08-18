angular
  .module('isa.dashboard.meetings')
  .service('MeetingsService', meetingsService);

function meetingsService($meteor, $q) {
  return {
    getMeetingTypeNames: getMeetingTypeNames,
    findLatestMeeting: findLatestMeeting,
    fetchPreviousMeetingItems: fetchPreviousMeetingItems
  };

  function getMeetingTypeNames() {
    return [
      {_id: 'mtg001', name: "Ad Hoc"},
      {_id: 'mtg002', name: "Weekly Management"},
      {_id: 'mtg003', name: "Weekly Operations"},
      {_id: 'mtg004', name: "Weekly Sales"},
      {_id: 'mtg005', name: "Weekly Support"},
      {_id: 'mtg006', name: "Monthly Management"},
      {_id: 'mtg007', name: "Quarterly Management Review"},
      {_id: 'mtg008', name: "6 Monthly Management Review"},
      {_id: 'mtg009', name: "Annual Management Review"}
    ]
  }

  function findLatestMeeting(typeName) {
    var answer = Meetings.findOne({type: typeName, date: {$lt: new Date()}}, {sort: [['date', 'desc']]});
    console.log('Found meeting', answer);
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
      .then(function (subHandle) {
        answer.attendees = _.map(Attendees.find({
          meetingId: prevMtg._id,
          isRegular: true
        }).fetch(), function (val) {
          return _.pick(val, 'name', 'initials', 'isRegular');
        });
        answer.agendaItems = _.map(AgendaItems.find({
          meetingId: prevMtg._id,
          isRegular: true
        }).fetch(), function (val) {
          return _.pick(val, 'itemNo', 'details', 'whoSubmitted', 'isRegular');
        });

        subHandle.stop();

        return answer;
      });
  }
}
