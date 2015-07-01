'use strict';

/**
 * Publishes a merged collection of both users and contacts.
 *
 * @todo MapReduce here..
 */
Meteor.publish("callTreeContacts", function() {
  return Meteor.users.find({});
});
