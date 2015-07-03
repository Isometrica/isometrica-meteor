'use strict';

describe("callTreeContacts", function() {

  beforeAll(function() {
    for (var i = 0; i < 10; ++i) {
      Meteor.call('registerUser', {
        email: "user" + i + "@user.com",
        password: "password123",
        profile: {
          firstName: "User" + 1,
          lastName: "Test"
        }
      });
      Contacts.insert({
        _id: i + 'C',
        name: 'Contact' + i + ' Test',
        email: 'contact' + i + '@contact.com'
      });
    }
    Meteor.loginWithPassword('user1@user.com', 'password123');
  });

  it("should transform contacts into call tree nodes", function(done) {
    var contacts = Meteor.subscribe("callTreeContacts", "", function() {
      var aContact = Contacts.findOne({
        contactId: 'C1'
      });
      expect(aContact).not.toBeEmpty();
      expect(aContact.ownerId).toBe('U1');
      expect(aContact.contactId).toBe('C1');
      expect(aContact.type).toBe('contact');
      done();
    });
  });

  it("should transform users into call tree nodes", function(done) {
    subscr = Meteor.subscribe("callTreeContacts", "", function() {
      var aUser = Meteor.users.findOne({});
      expect(aUser).not.toBeEmpty();
      expect(aUser.ownerId).toBe(Meteor.userId());
      expect(aUser.contactId).not.toBeEmpty();
      expect(aUser.type).toBe('user');
      done();
    });
  });

  it("should subscribe to user and contact collections", function(done) {
    subscr = Meteor.subscribe("callTreeContacts", "", function() {
      expect(Contacts.find({}).fetch().length).toBeGreaterThan(0);
      expect(Meteor.users.find({}).fetch().length).toBeGreaterThan(0);
      done();
    });
  });

  it("should filter by a given search term", function(done) {
    subscr = Meteor.subscribe("callTreeContacts", "User4", function() {
      expect(Meteor.users.find({}).fetch().length).toBe(1);
      done();
    });
  });

  it("should limit the result sets to 5", function(done) {
    subscr = Meteor.subscribe("callTreeContacts", "", function() {
      expect(Meteor.users.find({}).count()).toBe(5);
      expect(Contacts.find({}).count()).toBe(5);
      done();
    });
  });

});
