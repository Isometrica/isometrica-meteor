
Meetings = new MultiTenancy.Collection('meetings');
Schemas.Meetings = new MultiTenancy.Schema([Schemas.IsaBase, {
  type: {
    type: String,
    label: 'Type',
    isa: {
      fieldType: 'isaOrgAttribute',
      orgOptionKey: 'meetingTypes'
    }
  },
  date: {
    type: Date,
    label: 'Date'
  },
  notes: {
    type: String,
    label: 'Notes',
    optional: true,
    isa: {
      fieldType: 'isaTextarea',
      rows: 2
    }
  }
}]);

Meetings.attachSchema(Schemas.Meetings);

Meetings.allow({
  insert: function (userId) {
    return (userId ? true : false);
  },
  remove: function (userId) {
    return false;
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
  person: {
    type: Schemas.IsaPerson,
    label: 'Name',
    isa: {
      fieldType: 'isaUser'
    }
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
    return false;
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
    label: 'Agenda item',
    isa: {
      fieldType: 'isaTextarea'
    }
  },
  whoSubmitted: {
    type: Schemas.IsaPerson,
    label: 'Who submitted',
    optional: true,
    isa: {
      fieldType: 'isaUser'
    }
  },
  comments: {
    type: String,
    label: 'Comments',
    optional: true,
    isa: {
      fieldType: 'isaTextarea'
    }
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
    return false;
  },
  update: function (userId) {
    return (userId ? true : false);
  }
});

Schemas.trackHistory(Attendees, 'attendee', function(doc) { return doc.person.fullName }, ['_id', 'meetingId' ]);
Schemas.trackHistory(AgendaItems, 'agenda item', 'details', ['_id', 'meetingId']);
