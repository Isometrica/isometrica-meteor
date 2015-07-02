'use strict';

describe("callTreeContacts", function() {

  beforeEach(function() {

    var users = [
      {
        profile: {
          firstName: 'Mark',
          lastName: 'Leusink'
        },
        password: 'password123',
        email: 'mark@linqed.eu'
      },
      {
        profile: {
          firstName: 'Steve',
          lastName: 'Fortune'
        },
        password: 'password123',
        email: 'steve.fortune@icecb.com'
      },
      {
        profile: {
          firstName: 'Test1',
          lastName: 'Fortune'
        },
        password: 'password123',
        email: 'test1@icecb.com'
      },
      {
        profile: {
          firstName: 'Test2',
          lastName: 'Fortune'
        },
        password: 'password123',
        email: 'test2@icecb.com'
      },
      {
        profile: {
          firstName: 'Test3',
          lastName: 'Fortune'
        },
        password: 'password123',
        email: 'test3@icecb.com'
      },
      {
        profile: {
          firstName: 'Test4',
          lastName: 'Fortune'
        },
        password: 'password123',
        email: 'test4@icecb.com'
      }
    ];
    var contacts = [
      {
        name: 'Contact One',
        email: 'contact1@teamstudio.com'
      },
      {
        name: 'Contact Two',
        email: 'contact2@teamstudio.com'
      },
      {
        name: 'Contact Three',
        email: 'contact3@teamstudio.com'
      },
      {
        name: 'Contact Four',
        email: 'contact4@teamstudio.com'
      },
      {
        name: 'Contact Five',
        email: 'contact5@teamstudio.com'
      },
      {
        name: 'Contact Six',
        email: 'contact6@teamstudio.com'
      }
    ];

    _.each(users, function(user) {
      Accounts.createUser(user);
    });
    _.each(contacts, function(contact) {
      Contacts.insert(contact);
    });

  });

  it("should subscribe to user and contact collections", function(done) {

    Meteor.subscribe("callTreeContacts", "", function() {
      expect(Contacts.find({}).fetch().length).toBeGreaterThan(0);
      expect(Meteor.users.find({}).fetch().length).toBeGreaterThan(0);
      done();
    });

  });

  it("should filter by a given search term", function(done) {

    Meteor.subscribe("callTreeContacts", "Mark", function() {
      expect(Meteor.users.find({}).fetch().length).toBe(1);
      done();
    });

  });

  it("should limit the result sets to 5", function(done) {

    Meteor.subscribe("callTreeContacts", "", function() {
      expect(Meteor.users.find({}).count()).toBe(5);
      expect(Contacts.find({}).count()).toBe(5);
      done();
    });

  });

});
