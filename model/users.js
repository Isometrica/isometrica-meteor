'use strict';

var Users = Meteor.users;

Meteor.methods({
  registerUser: function(user) {
    console.log('Registering user !');
    console.log(user);
    Accounts.createUser(user);
  }
});
