'use strict';

describe("organisation", function() {

  beforeAll(function(done) {
    fixtures.setupCurrentUser(done);
  });

  afterAll(function() {
    Meteor.call('clearCollection', ['Organisations', 'Users', 'Memberships'], done);
  });

  describe("switchOrganisation", function() {

    it("should allow user to switch between their existing organisations", function(done) {
      Meteor.call('createOrganisation', 'Another org', function(orgId) {
        Meteor.call('createMembership', Meteor.userId(), orgId, function() {
          Meteor.call('switchOrganisation', orgId, function() {
            expect(Partitioner.group()).toBe(orgId);
            done();
          });
        });
      });
    });

    it("should forbid user from switching to a foreign organistaion", function(done) {
      Meteor.call('createOrganisation', 'Another org', function(orgId) {
        Meteor.call('switchOrganisation', orgId, function(err) {
          expect(err).toBeTruthy();
          expect(err.error).toBe(400);
          done();
        });
      });
    });

  });

  describe("currentOrganisation", function() {

    it("should return the current organisation of the user", function() {});

  });

  describe("Accounts.onLogin", function() {

    it("should set the current organisation", function() {});

  });

});
