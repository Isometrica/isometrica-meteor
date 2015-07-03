'use strict';

var Users = Meteor.users;

Users._transform = function(doc) {
  if (doc.profile) {
    _.extend(doc.profile, {
      fullName: doc.profile.firstName + ' ' + doc.profile.lastName
    });
  }
  return doc;
};

Meteor.methods({
  registerUser: function(user) {
    console.log('New user');
    Accounts.createUser(user);
  }
});
