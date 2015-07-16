
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

    beforeAll(function(done) {

      var orgOneId = Organisation.insert({
        name: "Org One"
      });
      var orgTwoId = Organisation.insert({
        name: "Org Two"
      });

      Meteor.call('registerOrganisationUser', {
        profile: {
          firstName: 'Mr',
          lastName: 'CEO'
        },
        password: 'password123',
        email: 'ceo@companyco.com'
      }, orgOneId, cb);

    });

    it("should hide documents in a foreign organisation from the current user", function() {

    });

    it("should show documents in the current user's organisation", function() {

    });

    it("should add organisation id as the partition key to new documents", function() {

    });

    it("should not allow current user to delete or update documents in a foreign organisation", function() {

    });

  });

};
