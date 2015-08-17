'use strict';

Meteor.publish("organisationAddresses", function() {
    return OrganisationAddresses.find({});
});
