'use strict';

Meteor.startup(function() {

  var log = console.log;
  var organisation = {
    name: "Teamstudio"
  };
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

  var canAddSamples = function(cb) {
    if (!(Meteor.users.find().count() || process.env.IS_MIRROR)) {
      cb();
    }
  };

  // @note Meteor.Collection.insert doesn't support batch unforunately.
  // Although we should be able to use a Mongo Collection driver directly..
  canAddSamples(function() {
    log('Creating sample data');
    var orgId = Organisations.insert(organisation);
    Partitioner.bindGroup(orgId, function() {
      _.each(users, function(user) {
        log('User: ' + user.profile.firstName + ' ' + user.profile.lastName);
        Meteor.call("registerOrganisationUser", user, orgId);
      });      
    });
  });

});
