
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
    console.log('Setup user: create user');
    fixtures.createUser(function(err, userId) {
      console.log('Login');
      Meteor.loginWithPassword('login@test.com', 'password123', function() {
        console.log('Create mem');
        Meteor.call('createMembership', userId, orgId, function() {
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
    email: email || 'ceo' + Math.random() + '@companyco.com'
  }, cb);
};

/**
 * Creates an independent user
 *
 * @param cb Function
 */
fixtures.createUser = function(cb, email) {
  console.log('Creating user');
  Meteor.call('registerUser', {
    profile: {
      firstName: 'Test',
      lastName: 'User'
    },
    password: 'password123',
    email: email || 'test' + Math.random() + '@user.com'
  }, function(err, userId) {
    console.log('Error creating user: ');
    console.log(err);
    cb(err, userId);
  });
};
