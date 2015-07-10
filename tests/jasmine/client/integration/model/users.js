'use strict';

describe('users', function() {

  beforeAll(function(done) {
    Meteor.subscribe('users', done);
  });

  beforeEach(function(done) {
    Meteor.call('clearCollection', 'Users', done);
  });

  describe('registerUser', function() {

    it('should register a new user', function(done) {

      Meteor.call('registerUser', {
        profile: {
          firstName: 'Test',
          lastName: 'User'
        },
        password: 'password123',
        email: 'test@user.com'
      }, function(err, userId) {
        var user = Meteor.users.findOne(userId);
        expect(user).toBeTruthy();
        expect(user.profile).toBeTruthy();
        expect(user.profile.firstName).toBe('Test');
        expect(user.profile.lastName).toBe('User');
        expect(user.emails).toContain({ address: 'test@user.com', verified: false });
        done();
      });

    });

    xit('should create new account for user', function() {});
    xit('should create default org for user', function() {});
    xit('should create sample org for user', function() {});
    /// @todo There will likely be many more of these

  });

});
