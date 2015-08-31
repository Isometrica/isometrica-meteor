Meteor.publish('organisationSettings', function() {
  return OrganisationSettings.find({});
});
