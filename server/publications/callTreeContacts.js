'use strict';

/**
 * Publishes a merged collection of both users and contacts.
 *
 * @todo MapReduce or something here. This looks good:
 * https://github.com/jhoxray/meteor-mongo-extensions
 */
Meteor.publish("callTreeContacts", function(search, userId) {

  var ownerId = userId || Meteor.userId();
  var self = this;

  var Users = Meteor.users;
  var limit = 10;
  var like = { $regex: new RegExp('.*' + search + '.*'), $options: 'i' };
  var predicate = {
    $or: [
      { name: like },
      { firstName: like },
      { lastName: like }
    ]
  };

  /**
   * Merged list of users and contacts that match the predicate.
   *
   * @var Array
   */
  var contacts = [];

  /**
   * Finds the index of an elm in an array based on the result of
   * the matcher function
   *
   * @param   arr     Array
   * @param   matcher Function
   * @return  Number
   */
  var indexOf = function(arr, matcher) {
    for (var i = 0, item; item = arr[i++];) {
      if (matcher(item, i)) {
        return i;
      }
    }
    return -1;
  };

  /**
   * An observer object that takes care of merging results into our
   * transient callTreeContacts collection.
   *
   * @var Object
   */
  var mergeObserver = function() {
    return {
      added: function(id, fields) {
        contacts.push(node);
        self.added('callTreeContacts', id, fields);
      },
      removed: function(id, fields) {
        var indx = indexOf(contacts, function(item) {
          return item._id = id;
        });
        contacts.splice(indx, 1);
        self.added('callTreeContacts', id, fields);
      }
    };
  };

  var contactsHandle = Contacts.find(sel, {
    limit: limit,
    transform: function(doc) {
      return {
        type: 'contact',
        name: doc.name,
        _id: doc._id,
        contactId: doc._id,
        ownerId: ownerId
      }
    }
  }).observeChanges(mergeObserver());

  var userHandle = Users.find(sel, {
    limit: limit,
    transform: function(doc) {
      return {
        type: 'user',
        name: doc.profile.fullName,
        _id: doc._id,
        contactId: doc._id,
        ownerId: ownerId
      }
    }
  }).observeChanges(mergeObserver());

  /**
   * Stop our observers - avoid leakage.
   */
  this.onStop(function() {
    contactsHandle.stop();
    userHandle.stop();
  });

});
