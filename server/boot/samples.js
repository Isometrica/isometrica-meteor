'use strict';

Meteor.startup(function() {

  var log = console.log;

  var consultant = {
    profile: {
      firstName: 'Mark',
      lastName: 'Leusink'
    },
    password: 'password123',
    email: 'mark@linqed.eu'
  };

  var zetaComm = {
    name: "ZetaComm",
    users: [
      {
        profile: {
          firstName: 'User',
          lastName: 'One'
        },
        password: 'password123',
        email: 'user1@zeta.com'
      },
      {
        profile: {
          firstName: 'User',
          lastName: 'Two'
        },
        password: 'password123',
        email: 'user2@zeta.com'
      }
    ]
  };

  var teamstudio = {
    name: "Teamstudio",
    users: [
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
    ]
  }

  var canAddSamples = function(cb) {
    if (!(Meteor.users.find().count() || process.env.IS_MIRROR)) {
      cb();
    }
  };

  // @note Meteor.Collection.insert doesn't support batch unforunately.
  // Although we should be able to use a Mongo Collection driver directly..
  canAddSamples(function() {
    log('Creating sample data');
    var consultantId = Meteor.call("registerUser", consultant);
    _.each([ teamstudio, zetaComm ], function(org) {
      var orgId = Organisations.insert({
        name: org.name
      });
      Partitioner.bindGroup(orgId, function() {
        for (var i = 0; i < 3; ++i) {
          Modules.insert({
            title: org.name + ' Module ' + i,
            type: 'docwiki'
          });
          Modules.insert({
            title: org.name + ' Template ' + i,
            type: 'docwiki',
            isTemplate: true
          });
          Modules.insert({
            title: org.name + ' Archived ' + i,
            type: 'docwiki',
            isArchived: true
          });
          Modules.insert({
            title: org.name + ' Trash ' + i,
            type: 'docwiki',
            inTrash: true
          });
        }
        _.each(org.users, function(user) {
          Meteor.call("registerOrganisationUser", user);
        });
        Memberships.insert({
          userId: consultantId,
          isAccepted: true
        });
      });
    });
    log('Sample data created');
  });

});
