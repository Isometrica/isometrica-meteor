'use strict';

describe("callTreeContacts", function() {

  beforeEach(function() {

    var users = [];
    var contacts = [];

    _.each(users, function(user) {
      Accounts.createUser(user);
    });
    _.each(contacts, function(contact) {
      Contacts.insert(contact);
    });

  });

  it("should merge contacts and users into one client side collection", function() {

    Meteor.subscribe('callTreeContacts');
    var contacts = clientContacts.find().fetch();

    expect(contacts.length).toBeGreaterThan(0);
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
