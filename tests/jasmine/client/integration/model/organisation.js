'use strict';

describe("organisation", function() {

  beforeAll(function(done) {
    fixtures.setupCurrentUser(done);
  });

  afterAll(function(done) {
    Meteor.logout();
    Meteor.call('clearCollection', ['Organisations', 'Users', 'Memberships'], done);
  });

  describe("switchOrganisation", function() {

    it("should allow user to switch between their existing organisations", function(done) {
      Meteor.call('createOrganisation', 'Another org', function(err, orgId) {
        Meteor.call('createMembership', Meteor.userId(), orgId, function(err) {
          Meteor.call('switchOrganisation', orgId, function() {
            expect(Partitioner.group()).toBe(orgId);
            done();
          });
        });
      });
    });

    it("should forbid user from switching to a foreign organistaion", function(done) {
      Meteor.call('createOrganisation', 'Yet another org', function(err, orgId) {
        Meteor.call('switchOrganisation', orgId, function(err) {
          expect(err).toBeTruthy();
          expect(err.error).toBe(400);
          done();
        });
      });
    });

  });

  describe("currentOrganisation", function() {

    it("should return the current organisation of the user", function(done) {
      Meteor.call('currentOrganisation', function(err, org) {
        expect(org._id).toBe(Partitioner.group());
        done();
      });
    });

  });

});
