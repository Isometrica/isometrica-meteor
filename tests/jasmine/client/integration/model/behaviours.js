
'use strict';

/**
 * Shared behaviour for testing whether a collection is partitioned by
 * organisation.
 *
 * @param col     Mongo.Collection  The collection that we want to assert is partitioned
 * @param testDoc Object            Prototype test doc to insert into the collection
 */
var itShouldBePartitioned = function(col, testDoc, pubName) {

  describe("partition", function(done) {

    var orgId;
    var userId;
    var docIds;
    var foreignOrgId;
    var foreignDocIds;

    beforeAll(function(done) {

      orgId = Organisations.insert({
        name: "Org One"
      });
      userId = Meteor.call('registerOrganisationUser', {
        profile: {
          firstName: 'Mr',
          lastName: 'CEO'
        },
        password: 'password123',
        email: 'ceo@org1.com'
      }, orgTwoId, function() {

        foreignOrgId = Organisations.insert({
          name: "Foreign Org"
        });

        docIds = [];
        foreignDocIds = [];

        var foreignDoc = _.extend({
          _groupId: foreignOrgId
        }, testDoc);
        var doc = _.extend({
          _groupId: orgId
        }, testDoc);

        for (var i = 0; i < 3; ++i) {
          docIds.push(col.insert(doc));
          foreignDocIds.push(col.insert(foreignDoc));
        }

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
