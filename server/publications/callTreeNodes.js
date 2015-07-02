'use strict';

/**
 * Publishes a merged collection of both users and contacts.
 *
 * @todo MapReduce or something here. This looks good:
 * https://github.com/jhoxray/meteor-mongo-extensions
 */
Meteor.publish("callTreeContacts", function(search) {

  /**
   * Preprocess into a node object with the current user as the owner.
   *
   * @param type  String
   * @return function
   */
  var transformFn = function(type) {
    return function(doc) {
      return {
        type: type,
        contactId: doc._id,
        ownerId: Meteor.userId()
      };
    };
  };

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

  return [
    Users.find(sel, _.extend(opts, {
      transform: transformFn('user')
    })),
    Contacts.find(sel,  _.extend(opts, {
      transform: transformFn('contact')
    }))
  ];

});
