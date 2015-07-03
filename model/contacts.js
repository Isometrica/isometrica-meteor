Contacts = new Mongo.Collection("contacts");

'use strict';

Contacts.allow({
  insert: function() {
    return true;
  }
});

Meteor.methods({});
