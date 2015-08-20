'use strict';

/**
 * Creates a load of sample data on startup.
 *
 * @author Steve Fortune
 */
Meteor.startup(function() {

  //set up settings
  if ( Settings.find({}).count() === 0 ) {

    console.log('Creating default settings');

    Settings.insert( {
      hostName : 'http://localhost',
      emailFromAddress : 'Isometrica <no-reply@isometrica.io>'
    });

  }

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

    var consultantId = Accounts.createUser(consultant);
    var consultantDoc = {
      _id: consultantId,
      name:
        consultant.profile.firstName + ' ' +
        consultant.profile.lastName
    };
    AccountSubscriptions.insert({
      organisationName: "Consultant Account",
      owner: consultantDoc,
      billingDetails: {
        email: 'billing@example.com',
        address: 'Example Co, New St, London',
        city: 'Village City',
        zip: 'Gl6 1NN',
        country: 'England'
      }
    });

    _.each([ teamstudio, zetaComm ], function(org) {
      var orgId = Organisations.insert({
        name: org.name,
        owner: consultantDoc
      });
      MultiTenancy.masqOp(orgId, function() {
        for (var i = 1; i <= 3; ++i) {
          Modules.insert({
            title: org.name + ' Module ' + i,
            type: 'docwiki',
            owner: consultantDoc
          });
          Modules.insert({
            title: org.name + ' Template ' + i,
            type: 'docwiki',
            isTemplate: true,
            owner: consultantDoc
          });
          Modules.insert({
            title: org.name + ' Archived ' + i,
            type: 'docwiki',
            owner: consultantDoc,
            isArchived: true
          });
          Modules.insert({
            title: org.name + ' Trash ' + i,
            type: 'docwiki',
            owner: consultantDoc,
            inTrash: true
          });
          Contacts.insert({
            name: 'Bob' + i + ' From ' + org.name
          });
          OrganisationAddresses.insert({
            name: 'Org ' + i
          });
        }
        org.users.forEach(function(user) {
          var userId = Accounts.createUser(user);
          Memberships.insert({
            userId: userId,
            isAccepted: true
          });
        });
        Memberships.insert({
          userId: consultantId,
          isAccepted: true
        });
      });
    });
  });

});
