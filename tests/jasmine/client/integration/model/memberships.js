'use strict';

describe('memberships', function() {

  var userId;
  var orgId;

  beforeAll(function(done) {
    userId = Meteor.call('registerUser', {
      profile: {
        firstName: 'Test',
        lastName: 'User'
      },
      password: 'password123',
      email: 'test@user.com'
    }, function(err, res) {
      userId = res;
      orgId = Organisations.insert({
        name: 'org'
      });
      Meteor.subscribe('memberships', orgId, done);
    });
  });

  beforeEach(function(done) {
    Meteor.call('clearCollection', 'Memberships', done);
  });

  describe('inviteUser', function() {

    it('should throw if membership already exists', function(done) {

      var compKey = {
        userId: userId,
        organisationId: orgId
      };
      Meteor.call('inviteUser', compKey);
      var err = Meteor.call('inviteUser', compKey, function(err, res) {
        expect(err).toBeTruthy();
        expect(err.error).toBe('not-found');
        expect(err.reason).toBe('Membership already exists');
        done();
      });

    });

    it('should create inactive membership', function(done) {

      var compKey = {
        userId: userId,
        organisationId: orgId
      };

      Meteor.call('inviteUser', compKey, function() {
        var mem = Memberships.findOne(compKey);
        expect(mem).toBeTruthy();
        expect(mem.userId).toBe(userId);
        expect(mem.organisationId).toBe(orgId);
        expect(mem.isAccepted).toBe(false);
        done();
      });

    });

  });

  describe('acceptMembership', function() {

    it('should make the membership active', function(done) {

      var compKey = {
        userId: userId,
        organisationId: orgId
      };
      Meteor.call('inviteUser', compKey, function() {
        Meteor.call('acceptMembership', compKey, function() {
          var mem = Memberships.findOne(compKey);
          expect(mem.isAccepted).toBeTruthy();
          done();
        });
      });

    });

    it('should throw if membership doesn t exist', function(done) {

      Meteor.call('acceptMembership', {
        userId: userId,
        organisationId: orgId
      }, function(err, result) {
        expect(err).toBeTruthy();
        expect(err.error).toBe('not-found');
        expect(err.reason).toBe('Membership not found');
        done();
      });

    });

  });

  describe('declineMembership', function() {

    it('should throw if membership doesn t exist', function(done) {
      Meteor.call('declineMembership', {
        userId: userId,
        organisationId: orgId
      }, function(err, result) {
        expect(err).toBeTruthy();
        expect(err.error).toBe('not-found');
        expect(err.reason).toBe('Pending membership not found');
        done();
      });
    });

    it('should throw if membership is already active', function(done) {

      var compKey = {
        userId: userId,
        organisationId: orgId
      };
      Meteor.call('inviteUser', compKey, function() {
        Meteor.call('acceptMembership', compKey, function() {
          Meteor.call('declineMembership', compKey, function(err, result) {
            expect(err).toBeTruthy();
            expect(err.error).toBe('not-found');
            expect(err.reason).toBe('Pending membership not found');
            done();
          });
        });
      });

    });

    it('should remove membership', function(done) {
      var compKey = {
        userId: userId,
        organisationId: orgId
      };
      Meteor.call('inviteUser', compKey, function(err) {
        Meteor.call('declineMembership', compKey, function(err) {
          var mem = Memberships.findOne(compKey);
          expect(err).toBeFalsy();
          expect(mem).toBeFalsy();
          done();
        });
      });
    });

  });

  describe('membershipExists', function(done) {

    it('should return true if membership exists', function(done) {
      var compKey = {
        userId: userId,
        organisationId: orgId
      };
      Meteor.call('inviteUser', compKey, function(err) {
        Meteor.call('membershipExists', compKey, function(err, res) {
          expect(res).toBe(true);
          done();
        });
      });
    });

    it('should return false if membership does not exist', function(done) {
      Meteor.call('membershipExists', {
        userId: userId,
        organisationId: orgId
      }, function(err, res) {
        expect(res).toBe(false);
        done();
      });
    });

  });

  xdescribe('removeMembership', function() {

    xit('should remove membership', function() {});
    xit('should migrate documents to new user', function() {});
    xit('should throw if successor is not specified', function() {});

  });

});
