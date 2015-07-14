'use strict';

/**
 * @note Clearly temporary until we get some partitioning going on.
 */
Meteor.publish("memberships", function(orgId) {
  Meteor.publishWithRelations({
    handle: this,
    collection: Memberships,
    filter: {
      organisationId: orgId
    },
    mappings: [{
      key: 'userId',
      collection: Meteor.users
    }]
  });
});
