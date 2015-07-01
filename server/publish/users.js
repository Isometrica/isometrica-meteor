'use strict';

/**
 * @note Clearly temporary until we get some partitioning going on.
 */
Meteor.publish("users", function() {
  return Meteor.users.find({});
});
