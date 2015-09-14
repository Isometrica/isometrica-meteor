'use strict';

/**
 * Creates a load of sample data on startup.
 *
 * @author Steve Fortune
 */
Meteor.startup(function() {

  //set up settings
  createDefaultSettings();
 
  //set up system texts
  createDefaultSystemTexts();

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
      fullName:
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
        OrganisationSettings.insert({});
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

//create default application settings
function createDefaultSettings() {

  if ( Settings.find({}).count() === 0 ) {

    console.log('Creating default settings');

    Settings.insert( {
      hostName : 'http://localhost',
      emailFromAddress : 'Isometrica <no-reply@isometrica.io>'
    });

  }

}

//create initial set of system texts
function createDefaultSystemTexts() {

  console.log('Creating default system texts');

  createSystemText( 'docwiki/email/approvedoc', 
    'Please approve "{{title}}"', 

    '<p>{{currentUser}} has just created a new issue in the document "{{title}}".</p>' +
        '<p>Since you are one of the approvers of the document you are requested to approve it.</p>' +
        '<p>Click <a href="{{pageLink}}">here</a> to open the document and approve it.</p>');

  createSystemText( 'docwiki/email/signdoc', 
    'Please sign "{{title}}"', 

    '<p>The document "{{title}}" has been approved.</p>' +
        '<p>Since you are one of the signers of the document you are requested to sign it.</p>' +
        '<p>Click <a href="{{pageLink}}">here</a> to open the document and sign it.</p>');

  createSystemText( 'docwiki/email/docapproved', 
    'Document "{{title}}" has been approved', 

    '<p>The document "{{title}}" has been approved by all approvers.</p>' +
    '<p>Click <a href="{{pageLink}}">here</a> to view the document.</p>');

  createSystemText( 'docwiki/email/newowner', 
    'You are now the owner of the document "{{title}}"',

    '<p>{{currentUser}} just made you the owner of the document titled ' +
    '<b><a href="{{pageLink}}">{{title}}</a></b>.</p>');

  createSystemText( 'docwiki/guidance', null,
    'General guidance for the DocWiki goes here');

  createSystemText( 'docwiki/guidance/approve', null,
    'Guidance for approving a DocWiki');

  createSystemText( 'docwiki/guidance/sign', null,
    'Guidance for signing a DocWiki');

  createSystemText( 'docwiki/email/page/added/published',
    'Page added to the document "{{docTitle}}',
    '<p>{{currentUser}} has added a page titled <b>{{pageTitle}}</b> ' +
        'to the document <b>{{docTitle}}</b>.</p>' +
        '<p>The page is automatically published. Click <a href=\"{{pageLink}}\">here</a> to view it.</p>');

  createSystemText( 'docwiki/email/page/added/forapproval',
    'Page added to the document "{{docTitle}}',
    '<p>{{currentUser}} has added a page titled <b>{{pageTitle}}</b> ' +
        'to the document <b>{{docTitle}}</b>.</p>' +
        '<p>The page isn\'t visible yet. Click <a href=\"{{pageLink}}\">here</a> to view the page and approve it for publication.</p>');

  createSystemText( 'docwiki/email/page/updated/published',
    'Page updated in the document "{{docTitle}}',
    '<p>{{currentUser}} has updated a page titled <b>{{pageTitle}}</b> ' +
        ' in the document <b>{{docTitle}}</b>.</p>' +
        '<p>The page is automatically published. Click <a href=\"{{pageLink}}\">here</a> to view the changes.</p>');

    createSystemText( 'docwiki/email/page/updated/forapproval',
    'Page updated in the document "{{docTitle}}',
    '<p>{{currentUser}} has updated a page titled <b>{{pageTitle}}</b> ' +
        ' in the document <b>{{docTitle}}</b>.</p>' +
        '<p>The page isn\'t visible yet. Click <a href=\"{{pageLink}}\">here</a> to view the changes and approve the page for publication.</p>');

}

function createSystemText( textId, subject, contents ) {

  if ( SystemTexts.find({ textId : textId}).count() === 0 ) {
    console.log('- system text: ' + textId);

    SystemTexts.insert( {
      textId : textId,
      subject : subject,
      contents : contents
    });

  }

}
