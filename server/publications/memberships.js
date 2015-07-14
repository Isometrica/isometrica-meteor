'use strict';

Meteor.publish("memberships", function(orgId) {
  return Meteor.publishWithRelations({
    handle: this,
    collection: Memberships,
  });
});
