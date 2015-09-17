var typePrefix = {
  meeting: 'MA'
};

Schemas.MeetingAction = new SimpleSchema({
  meetingId: {
    type: String
  },
  meetingType: {
    type: String
  },
  agendaItem: {
    type: String,
    label: 'Linked to agenda item'
  }
});

Actions = new MultiTenancy.Collection('actions');
Schemas.Actions = new MultiTenancy.Schema([Schemas.IsaBase, {
  type: {
    type: String
  },
  referenceNumber: {
    type: String,
    autoValue: function() {
      if (this.isInsert && Meteor.isServer) {
        var typeVal = this.field('type');
        var prefix = typePrefix[typeVal.value] || '$$';

        var org = this.field('_orgId');
        var counterName = prefix + '-' + (org && org.value ? org.value : 'global');
        var counter = incrementCounter(Counters, counterName);
        return prefix + counter;
      }
    }
  },
  description: {
    type: String,
    label: 'Description'
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
      fieldType: 'isaUser'
    }
  },
  notes: {
    type: String,
    optional: true,
    label: 'Notes',
    isa: {
      fieldType: 'isaTextarea'
    }
  },
  meeting: {
    type: Schemas.MeetingAction,
    optional: true
  }
}]);

Actions.attachSchema(Schemas.Actions);
Actions.allow({
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
