
fixtures = {};

'use strict';

/**
 * Creates a test user as part of an organisation and logs in as
 * them.
 *
 * @param cb  Function()
 */
fixtures.setupCurrentUser = function(cb) {
  Organisations.insert({
    name: "Test Org"
  }, function(err, orgId) {
    console.log('Created organisation');
    console.log(arguments);
    MultiTenancy.setOrgId(orgId);
    fixtures.createOrganisationUser(function(err, userId) {
      Meteor.loginWithPassword('login@test.com', 'password123', cb);
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
    email: email || 'ceo' + time() + '@companyco.com'
  }, cb);
};

/**
 * Creates an independent user
 *
 * @param cb Function
 */
fixtures.createUser = function(cb, email) {
  email = email || 'test' + time() + '@user.com';
  Meteor.call('registerUser', {
    profile: {
      firstName: 'Test',
      lastName: 'User'
    },
    password: 'password123',
    email: email
  }, cb);
};

/**
 * Current UTC millisecond time
 *
 * @return String
 */
var time = function() {
  return (new Date).getTime();
};
