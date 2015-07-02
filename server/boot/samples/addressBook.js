'use strict';

Meteor.startup(function() {

  var tb = Observatory.getToolbox();
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
        firstName: 'Michael',
        lastName: 'Hamilton'
      },
      password: 'password123',
      email: 'michael@teamstudio.com'
    },
    {
      profile: {
        firstName: 'Steve',
        lastName: 'Ives'
      },
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
    if (!Meteor.users.find().count() && !process.env.IS_MIRROR) {
      cb();
    }
  };

  // @note Meteor.Collection.insert doesn't support batch unforunately.
  // Although we should be able to use a Mongo Collection driver directly..
  canAddSamples(function() {
    tb.info('Creating sample data');
    _.each(users, function(user) {
      tb.info('User: ' + user.profile.firstName + ' ' + user.profile.lastName);
      Accounts.createUser(user);
    });
    _.each(contacts, function(contact) {
      tb.info('Contact: ' + contact.name);
      Contacts.insert(contact);
    });
  });

});
