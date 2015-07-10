
beforeAll(function(done) {
  Meteor.call('clearDb', done);
});

afterAll(function(done) {
  Meteor.call('clearDb', done);
});
