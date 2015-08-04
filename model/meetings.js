Meetings = new MultiTenancy.Collection('meetings');
Schemas.Meetings = new MultiTenancy.Schema([Schemas.IsaBase, {
  type: {
    type: String,
    label: 'Type'
  },
  date: {
    type: Date,
    label: 'Date'
  },
  notes: {
    type: String,
    label: 'Notes',
    optional: true
  }
}]);

Meetings.attachSchema(Schemas.Meetings);

Meetings.allow({
  insert: function (userId) {
    return (userId ? true : false);
  },
  remove: function (userId) {
    return (userId ? true : false);
  },
  update: function (userId) {
    return (userId ? true : false);
  }
});

Attendees = new MultiTenancy.Collection('attendees');
Schemas.Attendees = new MultiTenancy.Schema([Schemas.IsaBase, {
  meetingId: {
    type: String
  },
  name: {
    type: String,
    label: 'Name'
  },
  initials: {
    type: String,
    label: 'Initials',
    optional: true
  },
  isRegular: {
    type: Boolean,
    label: 'Regular attendee',
    optional: true,
    isa: {
      fieldType: 'isaYesNo'
    }
  }
}]);
Attendees.attachSchema(Schemas.Attendees);
Attendees.allow({
  insert: function (userId) {
    return (userId ? true : false);
  },
  remove: function (userId) {
    return (userId ? true : false);
  },
  update: function (userId) {
    return (userId ? true : false);
  }
});

AgendaItems = new MultiTenancy.Collection('agendaItems');
Schemas.AgendaItems = new MultiTenancy.Schema([Schemas.IsaBase, {
  meetingId: {
    type: String
  },
  itemNo: {
    type: Number,
    label: 'Number'
  },
  details: {
    type: String,
    label: 'Agenda item'
  },
  whoSubmitted: {
    type: String,
    label: 'Who submitted',
    optional: true
  },
  isRegular: {
    type: Boolean,
    label: 'Recurring',
    optional: true,
    isa: {
      fieldType: 'isaYesNo'
    }
  }
}]);
AgendaItems.attachSchema(Schemas.AgendaItems);
AgendaItems.allow({
  insert: function (userId) {
    return (userId ? true : false);
  },
  remove: function (userId) {
    return (userId ? true : false);
  },
  update: function (userId) {
    return (userId ? true : false);
  }
});
