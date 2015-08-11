'use strict';

Meteor.publish("accountSubscriptions", function() {
  return accountSubscriptions.find({
    'owner._id': this.userId
  });
});
