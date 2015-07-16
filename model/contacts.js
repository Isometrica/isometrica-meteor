
Contacts = new Mongo.Collection("contacts");

Partitioner.partitionCollection(Contacts);
//Partition(ContactSchema);

'use strict';

Contacts.allow({
  insert: function() {
    return true;
  }
});

Meteor.methods({});
