'use strict';

describe('users', function() {

  var userId;

  beforeAll(function(done) {
    Meteor.subscribe('all', ['Organisations', 'Memberships', 'Users'], done);
  });

  beforeEach(function(done) {
    fixtures.setupCurrentUser(function(id) {
      userId = id;
      done();
    });
  });

  afterEach(function(done) {
    Meteor.logout();
    Meteor.call('clearCollection', ['Organisations', 'Users', 'Memberships'], done);
  });

  describe('registerUser', function() {

    it('should register a new user', function(done) {
      fixtures.createUser(function(err, userId) {
        var user = Meteor.users.findOne(userId);
        expect(user).toBeTruthy();
        expect(user.profile).toBeTruthy();
        expect(user.profile.firstName).toBe('Test');
        expect(user.profile.lastName).toBe('User');
        expect(user.emails).toContain({ address: 'test@user.com', verified: false });
        done();
      }, 'test@user.com');
    });

    xit('should create new account for user', function() {});
    xit('should create default org for user', function() {});
    xit('should create sample org for user', function() {});
    /// @todo There will likely be many more of these

  });

  describe('registerOrganisationUser', function() {

    var userId;

    beforeEach(function(done) {
      fixtures.createOrganisationUser(function(err, id) {
        userId = id;
        done();
      });
    });

    it('should create new user', function() {
      var user = Meteor.users.findOne(userId);
      expect(user).toBeTruthy();
    });

    it('should create new active membership for the user', function() {
      var mem = Memberships.findOne({
        userId: userId
      });
      expect(mem).toBeTruthy();
      expect(mem.isAccepted).toBe(true);
    });

  });

  describe('updateUser', function() {

    it('should update user attributes', function(done) {
      Meteor.call('updateUser', userId, {
        email: 'new@email.com',
        firstName: 'Ben',
        lastName: 'Wood'
      }, {}, function(err) {
        var user = Meteor.users.findOne(userId);
        expect(user.emails).toContain({ address: 'new@email.com', verified: false });
        expect(user.profile.firstName).toBe('Ben');
        expect(user.profile.lastName).toBe('Wood');
        done();
      });
    });

    it('should update membership superpowers', function(done) {
      Meteor.call('updateUser', userId, {}, {
        canCreateUsers: true,
        canCreateDocuments: true,
        canEditOrgSettings: true,
        canViewAllWorkInboxes: true,
        canEditUserProfiles: true,
        canEditUserSuperpowers: true
      }, function() {
        var mem = Memberships.findOne({
          userId: userId
        });
        expect(mem.canCreateUsers).toBe(true);
        expect(mem.canCreateDocuments).toBe(true);
        expect(mem.canEditOrgSettings).toBe(true);
        expect(mem.canViewAllWorkInboxes).toBe(true);
        expect(mem.canEditUserProfiles).toBe(true);
        expect(mem.canEditUserSuperpowers).toBe(true);
        done();
      });
    });

  });

  describe("emailExists", function(done) {

    it("should return false if email does not exist", function(done) {
      Meteor.call('emailExists', 'not@existing.com', function(err, res) {
        expect(res).toBe(false);
        done();
      });
    });

    it("should return true if email does exist", function(done) {
      fixtures.createUser(function(err, userId) {
        Meteor.call('emailExists', 'test@user.com', function(err, res) {
          expect(res).toBe(true);
          done();
        });
      }, 'test@user.com');
    });

  });

});
