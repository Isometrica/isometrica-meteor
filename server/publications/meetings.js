Meteor.publish('meetings', function() {
  return Meetings.find({});
});

Meteor.publish('meeting-details', function(mtgId) {
  return Attendees.find({meetingId: mtgId});
});
