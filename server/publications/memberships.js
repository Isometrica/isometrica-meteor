'use strict';

/**
 * Publishes all of the current user's memberships (bypasses
 * partitioning)
 */
Meteor.publish("myMemberships", function() {
  var cur;
  var self = this;
  Partitioner.directOperation(function() {
    cur = Memberships.find({
      userId = self.userId
    });
  });
  return cur;
});

/**
 * Publishes all of the memberships (partitioned transparentely)
 */
Meteor.publish("memberships", function() {
  return Memberships.find({});
});
