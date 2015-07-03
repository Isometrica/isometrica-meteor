'use strict';

var Users = Meteor.users;

Meteor.methods({
  registerUser: function(user) {
    console.log('New user');
    Accounts.createUser(user);
  }
});
