
if (process.env.IS_MIRROR) {
  var tb = Observatory.getToolbox();
  var clearDb = function() {
    tb.info('Resetting the database.');
    Meteor.users.remove({});
    Contacts.remove({});
  };
  Meteor.methods({
    clearDb: clearDb
  });
}
