WorkbookActivities = new Mongo.Collection('WorkbookActivities');

WorkbookActivities.allow({
  insert: function (userId, doc) {
    console.log("WorkbookActivities.insert: %j", doc);
    var createOps = {
      moduleId: String,
      name: String,
      rtoDays: Match.Optional(Number)
    };

    return userId && Match.test(doc, createOps);
  },

  update: function (userId, doc, fields, modifierOrig) {
    var modifier = { $set: _.pick(modifierOrig.$set, 'name', 'rtoDays') };

    console.log("WorkbookActivities.update: %j", modifier);
    var editOps = {
      $set: {
        name: Match.Optional(String),
        rtoDays: Match.Optional(Number)
      }
    };

    return userId && Match.test(modifier, editOps);
  },

  remove: function (userId, party) {
    return userId;
  }
});
