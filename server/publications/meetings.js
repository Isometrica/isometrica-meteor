Meteor.publish('meetings', function() {
  return Meetings.find({});
});

Meteor.publish('meeting', function(id) {
  return Meetings.find({_id: id});
});

Meteor.publish('meetings-rel', function() {
  Meteor.publishWithRelations({
    handle: this,
    collection: Meetings,
    filter: { },
    mappings: [
      {
        reverse: true,
        key: 'meetingId',
        collection: Attendees,
        filter: { $$isaUserId: this.userId }
      },
      {
        reverse: true,
        key: 'meetingId',
        collection: AgendaItems,
        filter: { $$isaUserId: this.userId }
      },
      {
        reverse: true,
        key: 'meeting.meetingId',
        collection: Actions,
        filter: { $$isaUserId: this.userId }
      }
    ]
  })
});

Meteor.publish('meeting-details', function(mtgId) {
  return [
    Attendees.find({meetingId: mtgId}),
    AgendaItems.find({meetingId: mtgId}),
    Actions.find({'meeting.meetingId': mtgId})
    ];
});
