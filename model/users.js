'use strict';

var Users = Meteor.users;

Meteor.methods({
  registerUser: function(user) {
    Accounts.createUser(user);
  }
});
