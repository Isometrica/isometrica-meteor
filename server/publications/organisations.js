'use strict';

Meteor.publish("organisations", function() {
  return Organisations.find({});
});
