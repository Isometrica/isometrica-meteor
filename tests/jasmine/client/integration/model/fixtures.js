
fixtures = {};

'use strict';

/**
 * Creates a test user as part of an organisation and logs in as
 * them.
 *
 * @param cb  Function(Number, Number)
 */
fixtures.setupCurrentUser = function(cb) {
  Meteor.call('createOrganisation', 'Org', function(err, orgId) {
    fixtures.createUser(function(err, userId) {
      Meteor.loginWithPassword('login@test.com', 'password123', function() {
        Meteor.call('createMembership', Meteor.userId(), orgId, function() {
          cb(userId, orgId);
        });
      });
    }, 'login@test.com');
  });
};

/**
 * Reigsters a user using 'registerOrganisationUser'. Note that a current
 * logged in user that's part of a valid user is required.
 *
 * @param cb    Function
 * @param email String | null
 */
fixtures.createOrganisationUser = function(cb, email) {
  Meteor.call('registerOrganisationUser', {
    profile: {
      firstName: 'Mr',
      lastName: 'CEO'
    },
    password: 'password123',
    email: email || 'ceo' + rand() + '@companyco.com'
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
    email: email || 'test' + rand() + '@user.com'
  }, function(err, userId) {
    cb(err, userId);
  });
};

var rand = function() {
  return '_' + (new Date).getTime();
};
