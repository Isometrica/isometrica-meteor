
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
  createOrganisationUser(orgId, function(err, userId) {
    Meteor.loginWithPassword(userId, 'password123', function() {
      cb(userId, orgId);
    });
  });
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
  }, orgId, cb);
};

/**
 * Creates an independent user
 *
 * @param cb Function
 */
fixtures.createUser = function(cb) {
  Meteor.call('registerUser', {
    profile: {
      firstName: 'Test',
      lastName: 'User'
    },
    password: 'password123',
    email: 'test@user.com'
  }, cb);
};

beforeAll(function(done) {
});

afterAll(function(done) {
  Meteor.call('clearDb', done);
});
