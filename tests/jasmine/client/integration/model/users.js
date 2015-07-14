'use strict';

describe('users', function() {

  var orgId;

  var createOrganisationUser = function(cb) {
    Meteor.call('registerOrganisationUser', {
      profile: {
        firstName: 'Mr',
        lastName: 'CEO'
      },
      password: 'password123',
      email: 'ceo@companyco.com'
    }, orgId, cb);

  };

  var createUser = function(cb) {
    Meteor.call('registerUser', {
      profile: {
        firstName: 'Test',
        lastName: 'User'
      },
      password: 'password123',
      email: 'test@user.com'
    }, cb);
  }

  beforeAll(function(done) {
    orgId = Organisations.insert({
      name: 'Company Co'
    });
    Meteor.subscribe('organisations', function() {
      Meteor.subscribe('memberships', orgId, function() {
        Meteor.subscribe('users', done);
      });
    });
  });

  beforeEach(function(done) {
    Meteor.call('clearCollection', 'Users', function() {
      Meteor.call('clearCollection', 'Memberships', done);
    });
  });

  describe('registerUser', function() {

    it('should register a new user', function(done) {

      createUser(function(err, userId) {
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

  describe('registerOrganisationUser', function() {

    it('should create new user', function(done) {

      createOrganisationUser(function(err, userId) {
        var user = Meteor.users.findOne(userId);
        expect(user).toBeTruthy();
        done();
      });

    });

    it('should create new active membership between that user an the given organisation', function(done) {

      createOrganisationUser(function(err, userId) {
        var mem = Memberships.findOne({
          userId: userId,
          organisationId: orgId
        });
        expect(mem).toBeTruthy();
        expect(mem.isAccepted).toBe(true);
        done();
      });

    });

  });

  describe('updateUser', function() {

    it('should update user attributes', function(done) {
      createOrganisationUser(function(err, userId) {
        Meteor.call('updateUser', userId, {
          email: 'new@email.com',
          firstName: 'Ben',
          lastName: 'Wood'
        }, {}, orgId, function(err) {
          expect(err).toBeFalsy();
          var user = Meteor.users.findOne(userId);
          expect(user.emails).toContain({ address: 'new@email.com', verified: false });
          expect(user.profile.firstName).toBe('Ben');
          expect(user.profile.lastName).toBe('Wood');
          done();
        });
      });
    });

    it('should throw if user is not part of organisation', function(done) {
      createUser(function(err, userId) {
        Meteor.call('updateUser', userId, {}, {}, orgId, function(err) {
          expect(err).toBeTruthy();
          // @todo Specific application error
          done();
        });
      });
    });

    it('should update membership superpowers', function() {
      createOrganisationUser(function(err, userId) {
        Meteor.call('updateUser', userId, {}, {
          canCreateUsers: true,
          canCreateDocuments: true,
          canEditOrgSettings: true,
          canViewAllWorkInboxes: true,
          canEditUserProfiles: true,
          canEditUserSuperpowers: true
        }, orgId, function() {
          var mem = Memberships.findOne({
            userId: userId,
            organistationId: orgId
          });
          expect(mem.canCreateUsers).toBe(true);
          expect(mem.canCreateDocuments).toBe(true);
          expect(mem.canEditOrgSettings).toBe(true);
          expect(mem.canViewAllWorkInboxes).toBe(true);
          expect(mem.canEditUserProfiles).toBe(true);
          expect(mem.canEditUserSuperpowers).toBe(true);
        });
      });
    });

  });

});
