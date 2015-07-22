'use strict';

/**
 * Publishes all of the current user's memberships (bypasses
 * partitioning)
 */
Meteor.publish("myMemberships", function() {
  var self = this;
  Partitioner.directOperation(function() {
    Meteor.publishWithRelations({
      handle: self,
      collection: Memberships,
      filter: {
        userId: self.userId
      },
      mappings: [{
        key: 'userId',
        collection: Meteor.users
      }, {
        key: '_groupId',
        collection: Organisations
      }]
    });
  });
});

/**
 * Publishes all of the memberships (partitioned transparentely)
 */
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
