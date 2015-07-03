'use strict';

Meteor.publish("users", function() {
  return Meteor.users.find({}, {
    transform: function(doc) {
      if (doc.profile) {
        _.extend(doc.profile, {
          fullName: doc.profile.firstName + ' ' + doc.profile.lastName
        });
      }
      return doc;
    }
  });
});
