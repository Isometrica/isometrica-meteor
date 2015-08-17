Meteor.publish('meetings', function() {
  return Meetings.find({});
});

Meteor.publish('meeting-details', function(mtgId) {
  return [
    Attendees.find({meetingId: mtgId}),
    AgendaItems.find({meetingId: mtgId}),
    MeetingActions.find({meetingId: mtgId})
    ];
});
