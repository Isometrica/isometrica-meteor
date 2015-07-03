
'use strict';

describe("callTreeContacts", function() {

  var subscr;
  var callTreeContacts;

  beforeAll(function(done) {
    for (var i = 0; i < 10; ++i) {
      Meteor.call('registerUser', {
        email: "user" + i + "@user.com",
        password: "password123",
        profile: {
          firstName: "User" + i,
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
    callTreeContacts = new Mongo.Collection('callTreeContacts');
    subscr = Meteor.subscribe("callTreeContacts", "1", null, function() {
      console.log(callTreeContacts.find({}).fetch());
      done();
    });
  });

  afterAll(function() {
    subscr.stop();
    subscr = null;
    callTreeContacts = null;
  });

  it("should transform contacts into call tree nodes", function(done) {
    console.log('Are we read? ' + subscr.ready());
    var aContact = callTreeContacts.findOne({
      contactId: 'C1'
    });
    console.log('Contact found:');
    console.log(aContact);
    expect(aContact).not.toBeEmpty();
    expect(aContact.ownerId).toBe('U1');
    expect(aContact.contactId).toBe('C1');
    expect(aContact.type).toBe('contact');
  });

  it("should transform users into call tree nodes", function(done) {
    console.log('Are we read? ' + subscr.ready());
    var aUser = callTreeContacts.findOne({
      type: 'user'
    });
    expect(aUser).not.toBeEmpty();
    expect(aUser.ownerId).toBe(Meteor.userId());
    expect(aUser.contactId).not.toBeEmpty();
    expect(aUser.type).toBe('user');
  });

  /*it("should subscribe to user and contact collections", function() {
    subscr = Meteor.subscribe("callTreeContacts", "", function() {
      expect(Contacts.find({}).fetch().length).toBeGreaterThan(0);
      expect(Meteor.users.find({}).fetch().length).toBeGreaterThan(0);
      done();
    });
  });

  it("should filter by a given search term", function() {
    subscr = Meteor.subscribe("callTreeContacts", "User4", function() {
      expect(Meteor.users.find({}).fetch().length).toBe(1);
      done();
    });
  });

  it("should limit the result sets to 5", function() {
    subscr = Meteor.subscribe("callTreeContacts", "", function() {
      expect(Meteor.users.find({}).count()).toBe(5);
      expect(Contacts.find({}).count()).toBe(5);
      done();
    });
  });*/

});
