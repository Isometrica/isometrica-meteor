'use strict';

Meteor.publish("users", function() {
  return Meteor.users.find({}, {
    transform: function(doc) {
      return _.extend(doc, {
        fullName: doc.firstName + ' ' + doc.lastName
      });
    }
  });
});
