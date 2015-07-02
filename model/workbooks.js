WorkbookActivities = new Mongo.Collection('workbookActivities');
ImpactSchema = new SimpleSchema({
  name: {
    type: String
  },
  values: {
    type: [Number],
    minCount: 8,
    maxCount: 8
  },
  'mitigations.$.name': {
    type: String
  },
  'mitigations.$.values': {
    type: [Number],
    minCount: 8,
    maxCount: 8
  }
});

WorkbookActivitySchema = new SimpleSchema({
  moduleId: { type: String },
  name: { type: String },
  rtoDays: { type: Number },
  impacts: { type: [ ImpactSchema ]}
});

WorkbookActivities.allow({
  insert: function (userId, doc) {
    return userId && Match.test(doc, WorkbookActivitySchema);
  },

  update: function (userId, doc, fields, modifier) {
    return userId && Match.test(modifier, WorkbookActivitySchema);
  },

  remove: function (userId, party) {
    return userId;
  }
});
