
console.log('Client side before all !');

beforeAll(function(done) {
  console.log('Reset the db.');
  Meteor.call('clearDb', function() {
    console.log('Finished resetting db');
    console.log(arguments);
    done();
  });
});

afterAll(function(done) {
  Meteor.call('clearDb', done);
});
