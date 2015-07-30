Meteor.publish('meetings', function() {
  return Meetings.find({});
});
