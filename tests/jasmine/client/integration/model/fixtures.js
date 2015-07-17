
fixtures = {};

'use strict';

/**
 * Creates a test user as part of an organisation and logs in as
 * them.
 *
 * @param cb  Function(Object, Object)
 */
fixtures.setupTestUser = function(cb) {
  var orgId = Organisations.insert({
    name: 'Org'
  });
  fixtures.createUser(function(err, userId) {
    console.log('Created user with ' + userId);
    Meteor.loginWithPassword(userId, 'password123', function() {
      Memberships.insert({
        userId: userId,
        isAccepted: true
      });
      cb(userId, orgId);
    });
  }, 'login@man.com');
};

/**
 * Creates a user as part of an organisation with the given orgId
 *
 * @param orgId String
 * @param cb    Function
 */
fixtures.createOrganisationUser = function(orgId, cb) {
  Meteor.call('registerOrganisationUser', {
    profile: {
      firstName: 'Mr',
      lastName: 'CEO'
    },
    password: 'password123',
    email: 'ceo@companyco.com'
  }, cb);
};

/**
 * Creates an independent user
 *
 * @param cb Function
 */
fixtures.createUser = function(cb, email) {
  Meteor.call('registerUser', {
    profile: {
      firstName: 'Test',
      lastName: 'User'
    },
    password: 'password123',
    email: email || 'test@user.com'
  }, cb);
};

beforeAll(function(done) {
  Meteor.call('clearDb', done);
});

afterAll(function(done) {
  Meteor.call('clearDb', done);
});
