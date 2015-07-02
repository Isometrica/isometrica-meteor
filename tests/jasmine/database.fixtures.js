
/**
 * Define a 'reset' method for our tests. This drops the db.
 * Should be called on teardown of each test suite.
 *
 * @note Not sure whether this is the best approach.
 */
if (process.env.IS_MIRROR) {
  console.log('Registering reset method');
  Meteor.methods({
    reset: function(){
      console.log('Resetting database');
      Meteor.users.remove({});
      Contacts.remove({});
    }
  });
  Contacts.allow({
    insert: function() {
      return true;
    }
  });
}
