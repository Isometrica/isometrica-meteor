'use strict';

/**
 * @note Clearly temporary until we get some partitioning going on.
 */
Meteor.publish("contacts", function() {
  return Contacts.find({
    organisationId: orgId
  });
});
