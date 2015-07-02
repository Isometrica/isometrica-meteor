'use strict';

describe("callTreeContacts", function() {

  var clientContacts = new Mongo.Collection("callTreeContacts");

  beforeEach(function() {

  });

  it("should merge contacts and users into one clientside collection", function() {

    Meteor.subscribe('callTreeContacts');
    var contacts = clientContacts.find().fetch();

    expect(contacts).not.toBeEmpty();
    // @todo Assert contacts contains both contacts and suers

  });

  describe("predicate", function() {

    beforeEach(function() {

    });

    it("should sort the result sets alphabetically", function() {


    });

    it("should filter by a given search term", function() {


    });

    it("should limit the result sets to 5", function() {



    });

  });

});
