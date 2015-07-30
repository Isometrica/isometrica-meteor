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
