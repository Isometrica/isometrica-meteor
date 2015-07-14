'use strict';

/**
 * @note Clearly temporary until we get some partitioning going on.
 */
Meteor.publish("contacts", function(orgId) {
  console.log('Org id: ' + orgId);
  return Contacts.find({
    organisationId: orgId
  });
});
