'use strict';

Meteor.publish("memberships", function() {
  return Memberships.find({});
});
