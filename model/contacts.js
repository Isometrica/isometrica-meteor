Contacts = new Mongo.Collection("contacts");
Partitioner.partitionCollection(Contacts);

'use strict';

Contacts.allow({
  insert: function() {
    return true;
  }
});

Meteor.methods({});
