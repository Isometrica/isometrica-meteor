'use strict';

Meteor.publish("memberships", function() {
  Meteor.publishWithRelations({
    handle: this,
    collection: Memberships,
    filter: {},
    mappings: [{
      key: 'userId',
      collection: Meteor.users
    }]
  });
});
