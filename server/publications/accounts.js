'use strict';

Meteor.publish("accountSubscriptions", function() {
  return AccountSubscriptions.find({
    'owner._id': this.userId
  });
});
