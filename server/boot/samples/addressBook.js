'use strict';

Meteor.startup(function() {

  var users = [
    {
      firstName: 'Mark',
      lastName: 'Leusink',
      password: 'password123',
      email: 'mark@linqed.eu'
    },
    {
      firstName: 'Steve',
      lastName: 'Fortune',
      password: 'password123',
      email: 'steve.fortune@icecb.com'
    },
    {
      firstName: 'Michael',
      lastName: 'Hamilton',
      password: 'password123',
      email: 'michael@teamstudio.com'
    },
    {
      firstName: 'Steve',
      lastName: 'Ives',
      password: 'password123',
      email: 'steve@teamstudio.com'
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
    }
  ];

  var canAddSamples = function(cb) {
    if (!Meteor.users.find().count()) {
      cb();
    }
  };

  // @note Meteor.Collection.insert doesn't support batch unforunately.
  // Although we should be able to use a Mongo Collection driver directly.. 
  canAddSamples(function() {
    _.each(users, function(user) {
      Meteor.users.insert(user);
    });
    _.each(contacts, function(user) {
      Contacts.insert(user);
    });
  });

});
