SimpleSchema.debug = true;

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

Schemas.WorkbookActivity = new SimpleSchema({
  moduleId: { type: String },
  name: {
    type: String,
    optional: false,
    label: 'Activity or process'
  },
  mtpdDays: {
    type: Number,
    optional: true,
    min: 0,
    label: 'MTPD',
    isa: {
      helpId: 'helpMTPD'
    }
  },
  rtoDays: {
    type: Number,
    optional: true,
    min: 0,
    label: 'RTO',
    isa: {
      helpId: 'helpRTO'
    }
  },
  impacts: {
    type: [ ImpactSchema ],
    optional: true
  },
  'itsystems.$.name': {
    type: String
  },
  'itsystems.$.rpo': {
    type: Number,
    min: 0
  }
});

WorkbookActivities.attachSchema(Schemas.WorkbookActivity);
WorkbookActivities.allow({
  insert: function (userId, doc) {
    return userId;
  },
  update: function (userId, doc, fields, modifier) {
    console.log("Update w/ Modifier: %j", modifier);
    return userId;
  },
  remove: function (userId, party) {
    return userId;
  }
});
