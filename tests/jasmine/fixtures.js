
if (process.env.IS_MIRROR) {
  if (Meteor.isServer) {
    Meteor.methods({
      /**
       * For our fixture, this drops the db. Should be called on teardown of
       * each test suite.
       */
      reset: function(){
        console.log('Resetting !');
        var db = Meteor.users.find()._mongo.db;
        db.dropDatabase();
      }
    });
  }
  } else {}
}
