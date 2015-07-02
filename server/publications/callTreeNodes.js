'use strict';

/**
 * Publishes a merged collection of both users and contacts.
 *
 * @todo MapReduce or something here. This looks good:
 * https://github.com/jhoxray/meteor-mongo-extensions
 */
Meteor.publish("callTreeContacts", function(search) {

  var Users = Meteor.users;
  var like = { $regex: new RegExp('/.*' + search + '.*/'), $options: 'i' };
  var sel = {
    $or: [
      { name: like },
      { firstName: like },
      { lastName: like }
    ]
  };
  var opts = {
    limit: 5
  };
  console.log(sel);
  return [
    Users.find(sel, opts),
    Contacts.find(sel, opts)
  ];

});
