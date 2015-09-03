'use strict';

/**
 * Publishes memberships and associated users / orgs.
 *
 * This publication is currently quite key to the access control. It will
 * only publish users and organisations related to Memberships. In turn,
 * the MultiTenancy will only allow the Memberships to be published that
 * the user has access (as they are partitioned collections). The result
 * is that through this publication all the memberships, users and
 * organisations that a user has access to are exposed (but no more).
 *
 * @author Steve Fortune
 */
Meteor.publish("memberships", function() {
  Meteor.publishWithRelations({
    handle: this,
    collection: Memberships,
    filter: {
      isAccepted: true
    },
    mappings: [{
      key: 'userId',
      collection: Meteor.users
    }, {
      key: '_orgId',
      collection: Organisations
    }]
  });
});
