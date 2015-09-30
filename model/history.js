
History = new MultiTenancy.Collection('history');
Schemas.History =  new MultiTenancy.Schema({
  reference: {
    type: [ SimpleSchema.RegEx.Id ]
  },
  itemType: {
    type: String
  },
  who: {
    type: Object
  },
  'who._id': {
    type: SimpleSchema.RegEx.Id
  },
  'who.fullName': {
    type: String
  },
  at: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      }
    }
  },
  action: {
    type: String,
    allowedValues: [ 'Added', 'Updated', 'Removed' ]
  },
  description: {
    type: String
  },
  doc: {
    type: Object
  },
  'doc.previous': {
    type: Object,
    blackbox: true,
    optional: true
  },
  'doc.current': {
    type: Object,
    blackbox: true,
    optional: true
  }
});

History.attachSchema(Schemas.History);
