Meteor.publish('meetings', function() {
  return Meetings.find({});
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
        key: 'meetingId',
        collection: MeetingActions,
        filter: { $$isaUserId: this.userId }
      }
    ]
  })
});

Meteor.publish('meeting-details', function(mtgId) {
  return [
    Attendees.find({meetingId: mtgId}),
    AgendaItems.find({meetingId: mtgId}),
    MeetingActions.find({meetingId: mtgId})
    ];
});
