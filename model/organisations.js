Organisations = new Mongo.Collection('organisations');

Timestamp(Organisations);

OrganisationSchema = new SimpleSchema({
  name: {
    type: String,
    optional: false
  }
});

Meteor.methods({

  switchOrganisation: function(orgId) {},

  currentOrganisation: function() {}

  login: function(email, password) {}

});

Accounts.onLogin = function() {};
