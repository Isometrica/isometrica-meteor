'use strict';

describe('memberships', function() {

  var userId;
  var orgId;

  beforeAll(function(done) {
    Meteor.call('registerUser', {
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
      Meteor.subscribe('memberships', done);
    });
  });

  beforeEach(function(done) {
    Meteor.call('clearCollection', 'Memberships', done);
  });

  itShouldBePartitioned(Memberships);

  describe('inviteUser', function() {

    it('should throw if membership already exists', function(done) {

      Meteor.call('inviteUser', userId);
      var err = Meteor.call('inviteUser', userId, function(err, res) {
        expect(err).toBeTruthy();
        expect(err.error).toBe(404);
        expect(err.reason).toBe('Membership already exists');
        done();
      });

    });

    it('should create inactive membership', function(done) {

      Meteor.call('inviteUser', userId, function() {
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

      Meteor.call('inviteUser', userId, function() {
        Meteor.call('acceptMembership', userId, function() {
          var mem = Memberships.findOne(userId);
          expect(mem.isAccepted).toBeTruthy();
          done();
        });
      });

    });

    it('should throw if membership doesn t exist', function(done) {

      Meteor.call('acceptMembership', userId, function(err, result) {
        expect(err).toBeTruthy();
        expect(err.error).toBe(404);
        expect(err.reason).toBe('Membership not found');
        done();
      });

    });

  });

  describe('declineMembership', function() {

    it('should throw if membership doesn t exist', function(done) {
      Meteor.call('declineMembership', userId, function(err, result) {
        expect(err).toBeTruthy();
        expect(err.error).toBe(404);
        expect(err.reason).toBe('Pending membership not found');
        done();
      });
    });

    it('should throw if membership is already active', function(done) {

      Meteor.call('inviteUser', userId, function() {
        Meteor.call('acceptMembership', userId, function() {
          Meteor.call('declineMembership', userId, function(err, result) {
            expect(err).toBeTruthy();
            expect(err.error).toBe(404);
            expect(err.reason).toBe('Pending membership not found');
            done();
          });
        });
      });

    });

    it('should remove membership', function(done) {

      Meteor.call('inviteUser', userId, function(err) {
        Meteor.call('declineMembership', userId, function(err) {
          var mem = Memberships.findOne(userId);
          expect(err).toBeFalsy();
          expect(mem).toBeFalsy();
          done();
        });
      });

    });

  });

  describe('membershipExists', function(done) {

    it('should return true if membership exists', function(done) {
      Meteor.call('inviteUser', userId, function(err) {
        Meteor.call('membershipExists', userId, function(err, res) {
          expect(res).toBe(true);
          done();
        });
      });
    });

    it('should return false if membership does not exist', function(done) {
      Meteor.call('membershipExists', userId, function(err, res) {
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
