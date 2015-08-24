Meteor.publish('meetings', function() {
  return Meetings.find({});
});

Meteor.publish('meetings-rel', function() {
  Meteor.publishWithRelations({
    handle: this,
    collection: Meetings,
    filter: { inTrash: false },
    mappings: [
      {
        reverse: true,
        key: 'meetingId',
        collection: Attendees,
        filter: { inTrash: false, $$isaUserId: this.userId }
      },
      {
        reverse: true,
        key: 'meetingId',
        collection: AgendaItems,
        filter: { inTrash: false, $$isaUserId: this.userId }
      },
      {
        reverse: true,
        key: 'meetingId',
        collection: MeetingActions,
        filter: { inTrash: false, $$isaUserId: this.userId }
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
