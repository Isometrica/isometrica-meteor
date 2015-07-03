'use strict';

describe("callTreeContacts", function() {

  beforeAll(function() {
    for (var i = 0; i < 10; ++i) {
      Meteor.call('registerUser', {
        email: "User" + i + "@user.com",
        password: "password123",
        profile: {
          firstName: "User" + 1,
          lastName: "Test"
        }
      });
      Contacts.insert({
        _id: i + 'C',
        name: 'Contact' + i + ' Test',
        email: i + '@contact.com'
      });
    }
    Meteor.loginWithPassword('1@user.com', 'password123');
  });

  it("should transform users into call tree nodes", function(done) {
    var subscr = Meteor.subscribe("callTreeContacts", "", function() {
      var aUser = Meteor.users.findOne({});
      expect(aUser).not.toBeEmpty();
      expect(aUser.ownerId).toBe(Meteor.userId());
      expect(aUser.contactId).not.toBeEmpty();
      expect(aUser.type).toBe('user');
      done();
      subscr.stop();
    });
  });

  it("should transform contacts into call tree nodes", function(done) {
    var subscr = Meteor.subscribe("callTreeContacts", "", function() {
      var contact1 = Contacts.findOne({
        contactId: 'C1'
      });
      expect(contact1).not.toBeEmpty();
      expect(contact1.ownerId).toBe(new Mongo.ObjectID('U1'));
      expect(contact1.contactId).toBe(new Mongo.ObjectID('C1'));
      expect(contact1.type).toBe('contact');
      done();
      subscr.stop();
    });
  });

  it("should subscribe to user and contact collections", function(done) {
    var subscr = Meteor.subscribe("callTreeContacts", "", function() {
      expect(Contacts.find({}).fetch().length).toBeGreaterThan(0);
      expect(Meteor.users.find({}).fetch().length).toBeGreaterThan(0);
      done();
      subscr.stop();
    });
  });

  it("should filter by a given search term", function(done) {
    var subscr = Meteor.subscribe("callTreeContacts", "User4", function() {
      //console.log('Found by term');
      //console.log(Meteor.users.find({}).fetch());
      expect(Meteor.users.find({}).fetch().length).toBe(1);
      done();
      subscr.stop();
    });
  });

  it("should limit the result sets to 5", function(done) {
    var subscr = Meteor.subscribe("callTreeContacts", "", function() {
      //console.log('Found users');
      //console.log(Meteor.users.find({}).fetch());
      expect(Meteor.users.find({}).count()).toBe(5);
      expect(Contacts.find({}).count()).toBe(5);
      done();
      subscr.stop();
    });
  });

});
