'use strict';

describe("callTreeContacts", function() {

  beforeAll(function() {
    for (var i = 0; i < 10; ++i) {
      Accounts.createUser({
        _id: i + 'U',
        email: "test" + i + "@user.com",
        password: "password123",
        profile: {
          firstName: i,
          lastName: "Testington"
        }
      });
      Contacts.insert({
        _id: i + 'C',
        name: i + ' Contactington',
        email: i + '@contact.com'
      });
    }
    Meteor.loginWithPassword('1@user.com', 'password123');
  });

  afterAll(function() {
    Meteor.call('reset');
  });

  it("should transform users into call tree nodes", function(done) {
    var subscr = Meteor.subscribe("callTreeContacts", "", function() {
      console.log('Users');
      console.log(Meteor.users.find({}).fetch());
      var user2 = Meteor.users.findOne({
        contactId: 'U2'
      });
      expect(user2).not.toBeEmpty();
      expect(user2.ownerId).toBe(new Mongo.ObjectID('U1'));
      expect(user2.contactId).toBe(new Mongo.ObjectID('U2'));
      expect(user2.type).toBe('user');
      done();
      subscr.stop();
    });
  });

  it("should transform contacts into call tree nodes", function(done) {
    var subscr = Meteor.subscribe("callTreeContacts", "", function() {
      console.log('Contacts');
      console.log(Contacts.find({}).fetch());
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
    var subscr = Meteor.subscribe("callTreeContacts", "4", function() {
      expect(Meteor.users.find({}).fetch().length).toBe(1);
      done();
      subscr.stop();
    });
  });

  it("should limit the result sets to 5", function(done) {
    var subscr = Meteor.subscribe("callTreeContacts", "", function() {
      expect(Meteor.users.find({}).count()).toBe(5);
      expect(Contacts.find({}).count()).toBe(5);
      done();
      subscr.stop();
    });
  });

});
