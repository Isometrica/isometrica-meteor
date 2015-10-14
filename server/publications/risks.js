'use strict';

Meteor.publish("risks", function() {
  return Risks.find({});
});
