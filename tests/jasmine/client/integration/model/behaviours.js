
'use strict';

/**
 * Shared behaviour for testing whether a collection is partitioned by
 * organisation.
 *
 * @param col     Mongo.Collection  The collection that we want to assert is partitioned
 * @param testDoc Object            Prototype test doc to insert into the collection
 */
var itShouldBePartitioned = function(col, testDoc) {

  describe("partition", function(done) {

    var orgOneId;
    var orgOneDocs;
    var orgTwoId;
    var orgTwoDocs;
    var userId;

    beforeAll(function(done) {

      orgOneId = Organisation.insert({
        name: "Org One"
      });
      orgTwoId = Organisation.insert({
        name: "Org Two"
      });

      var orgTwoUserId = Meteor.call('registerOrganisationUser', {
        profile: {
          firstName: 'Mr',
          lastName: 'CEO'
        },
        password: 'password123',
        email: 'ceo@org2.com'
      }, orgTwoId, cb);

      Meteor.loginWithPassword(orgTwoUserId, 'password123');



      Meteor.logout();

      userId = Meteor.call('registerOrganisationUser', {
        profile: {
          firstName: 'Mr',
          lastName: 'CEO'
        },
        password: 'password123',
        email: 'ceo@org1.com'
      }, orgOneId, cb);

    });

    it("should hide documents in a foreign organisation from the current user", function(done) {



    });

    it("should show documents in the current user's organisation", function() {

    });

    it("should add organisation id as the partition key to new documents", function() {

    });

    it("should not allow current user to delete or update documents in a foreign organisation", function() {

    });

  });

};
