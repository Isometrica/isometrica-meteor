
/**
 * Define a 'reset' method for our tests. This drops the db.
 * Should be called on teardown of test suites
 */
if (process.env.IS_MIRROR) {

  var tb = Observatory.getToolbox();

  console.log('Resgister reset method');

  var clearDb = function() {
    console.log('Resetting the db..');
    Meteor.users.remove({});
    Contacts.remove({});
  };
  Meteor.methods({
    clearDb: function() {
      console.log('Clearing db');
      clearDb();
    }
  });

}
