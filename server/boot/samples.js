'use strict';

/**
 * Creates a load of sample data on startup.
 *
 * @author Steve Fortune
 */
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

  canAddSamples(function() {
    log('Creating sample data');
    var consultantId = Meteor.call("registerUser", consultant);
    _.each([ teamstudio, zetaComm ], function(org) {
      var orgId = Organisations.insert({
        name: org.name
      });
      for (var i = 0; i < 3; ++i) {
        Modules.insert({
          title: org.name + ' Module ' + i,
          _orgId: orgId,
          type: 'docwiki'
        });
        Modules.insert({
          title: org.name + ' Template ' + i,
          type: 'docwiki',
          _orgId: orgId,
          isTemplate: true
        });
        Modules.insert({
          title: org.name + ' Archived ' + i,
          type: 'docwiki',
          _orgId: orgId,
          isArchived: true
        });
        Modules.insert({
          title: org.name + ' Trash ' + i,
          type: 'docwiki',
          _orgId: orgId,
          inTrash: true
        });
      }
      _.each(org.users, function(user) {
        Meteor.call("registerOrganisationUser", user);
      });
      Memberships.insert({
        userId: consultantId,
        _orgId: orgId,
        isAccepted: true
      });
    });
    log('Sample data created');
  });

});
