'use strict';

/**
 * Returns a closure for handling a query.
 *
 * @param success Function
 * @return Function
 */
var handleQuery = function(success) {
  return function(err, res) {
    if (err) {
      var tb = Observatory.getToolbox();
      tb.error('Bad db operation: ' + err);
    } else {
      success(res);
    }
  }
};

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

  canAddSamples(function() {
    Meteor.users.insert(users, handleQuery(function() {
      Contacts.insert(contacts, handleQuery(function() {}));
    }));
  });

});
