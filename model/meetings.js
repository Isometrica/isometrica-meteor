Schemas.IsaPerson = new SimpleSchema({
  _id: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },
  fullName: {
    type: String
  },
  initials: {
    type: String,
    autoValue: function() {
      if (this.isInsert && !this.isSet) {
        var name = this.siblingField('fullName');
        if (name.isSet && typeof name.value === 'string') {
          var parts = name.value.toUpperCase().split(' ');
          var answer = '';
          if (0 != parts.length) {
            answer += parts[0].charAt(0);
          }
          if (parts.length > 0) {
            answer += parts[parts.length - 1].charAt(0);
          }
          return answer;
        }
      }
    }
  },
  type: {
    type: String,
    allowedValues: ['User', 'Contact', 'Other']
  }
});

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

MeetingActions = new MultiTenancy.Collection('meetingActions');
Schemas.MeetingActions = new MultiTenancy.Schema([Schemas.IsaBase, {
  meetingId: {
    type: String
  },
  meetingType: {
    type: String
  },
  referenceNumber: {
    type: String,
    autoValue: function() {
      if (this.isInsert && Meteor.isServer) {
        var org = this.field('_orgId');
        var counterName = 'MA-' + (org && org.value ? org.value : 'global');
        var counter = incrementCounter(Counters, counterName);
        return 'MA' + counter;
      }
    }
  },
  agendaItem: {
    type: String,
    label: 'Linked to agenda item'
  },
  description: {
    type: String,
    label: 'Action item'
  },
  targetDate: {
    type: Date,
    label: 'Target date'
  },
  status: {
    type: Schemas.IsaStatus
  },
  owner: {
    type: Schemas.IsaPerson,
    label: 'Owner',
    isa: {
      fieldType: 'isaUser',
      userTypes: ['User', 'Contact']
    }
  },
  notes: {
    type: String,
    optional: true,
    label: 'Notes',
    isa: {
      fieldType: 'isaTextarea'
    }
  }
}]);
MeetingActions.attachSchema(Schemas.MeetingActions);
MeetingActions.allow({
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
