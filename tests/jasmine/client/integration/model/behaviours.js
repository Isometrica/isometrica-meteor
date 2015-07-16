
'use strict';

/**
 * Shared behaviour for testing whether a collection is partitioned by
 * organisation. Assumes the proper subscription has been made.
 *
 * @param col     Mongo.Collection  The collection that we want to assert is partitioned
 * @param testDoc Object            Prototype test doc to insert into the collection
 */
var itShouldBePartitioned = function(col, testDoc) {

  describe("partition", function() {

    var orgId;
    var userId;
    var docIds;

    var foreignOrgId;
    var foreignDocIds;

    beforeAll(function(done) {

      testDoc = testDoc || {};
      orgId = Organisations.insert({
        name: "Org One"
      });
      foreignOrgId = Organisations.insert({
        name: "Foreign Org"
      });

      var buildDocFixtures = function(orgId) {
        var doc = _.extend({
          _groupId: orgId
        }, testDoc);
        var ids = [];
        for (var i = 0; i < 3; ++i) {
          ids.push(col.insert(doc));
        }
        return ids;
      };

      Meteor.call('registerOrganisationUser', {
        profile: {
          firstName: 'Mr',
          lastName: 'CEO'
        },
        password: 'password123',
        email: 'ceo@org1.com'
      }, orgTwoId, function(err, id) {
        userId = id;
        docIds = buildDocFixtures(orgId);
        foreignDocIds = buildDocFixtures(foreignOrgId);
        Meteor.loginWithPassword(orgId, 'password123', done);
      });

    });

    it("should add organisation id as the partition key to new documents", function() {

      var docId = col.insert(testDoc);
      var doc = col.findOne(docId);

      expect(doc._groupId).toBe(orgId);

    });

    it("should only show documents in the current user's organisation", function(done) {

      Meteor.subscribe(pubName, function() {
        var docs = col.find({}).fetch();
        var hasForeignId = docs.reduce(function(prev, curr, index, array) {
          var candidateId = array[index]._id;
          return prev && !~foreignDocIds.indexOf(candidateId);
        });
        expect(hasForeignId).toBe(false);
        done();
      });

    });

    it("should hide foreign documents from current user", function(done) {

      var foreignId = foreignDocIds[0];
      var assertFailed = function(cb) {
        return function(err) {
          expect(err).not.toBeFalsy();
          cb();
        };
      }
      expect(col.findOne(foreignDocIds[0])).toBeFalsy();
      col.update(foreignId, testDoc, null, assertFailed(function() {
        col.remove(foreignId, done);
      }));

    });

  });

};
