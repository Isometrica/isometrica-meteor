
/**
 * Define a 'reset' method for our tests. This drops the db.
 * Should be called on teardown of each test suite.
 *
 * @note Not sure whether this is the best approach.
 */
if (process.env.IS_MIRROR) {
  Meteor.methods({
    reset: function(){
      console.log('Resetting !');
      var db = Meteor.users.find()._mongo.db;
      db.dropDatabase();
    }
  });
}
