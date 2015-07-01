'use strict';

/**
 * Publishes a merged collection of both users and contacts.
 *
 * @todo MapReduce or something here. This looks good:
 * https://github.com/jhoxray/meteor-mongo-extensions
 */
Meteor.publish("callTreeContacts", function(search) {

  var Users = Meteor.users;
  var sel = {
    name: {
      like: '.*' + search + '.*'
    }
  };
  var opts = {
    limit: 5
  };
  return [
    Users.find(sel, opts),
    Contacts.find(sel, opts)
  ];

});
