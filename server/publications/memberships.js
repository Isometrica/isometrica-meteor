'use strict';

/**
 * Publishes memberships and associated users / orgs. Note that this will
 * only publish memberships that are part of organisations that a user has
 * has access to (see MultiTenancy).
 */
Meteor.publish("memberships", function() {
  Meteor.publishWithRelations({
    handle: this,
    collection: Memberships,
    filter: {},
    mappings: [{
      key: 'userId',
      collection: Meteor.users
    }, {
      key: '_orgId',
      collection: Organisations
    }]
  });
});
