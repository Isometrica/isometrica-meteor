'use strict';

/**
 * Publishes a merged collection of both users and contacts.
 *
 * @todo MapReduce or something here. This looks good:
 * https://github.com/jhoxray/meteor-mongo-extensions
 */
Meteor.publish("callTreeContacts", function(userId) {

  var ownerId     = userId || this.userId,
      pub         = this,
      colIdentity = "callTreeContacts",
      Users       = Meteor.users,
      limit       = 10;

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
   * @note Couldn't get conventional transform functions to work.
   * think its something to do with this:
   * https://github.com/meteor/meteor/issues/885
   * @param   transformFn   function
   * @return  Object
   */
  var mergeObserver = function(transformFn) {
    return {
      added: function(id, fields) {
        fields = transformFn(fields);
        contacts.push(fields);
        pub.added(colIdentity, id, fields);
        console.log('----- Added: ');
        console.log(fields);
        console.log('----- - - Result');
        console.log(contacts);
      },
      removed: function(id) {
        var indx = indexOf(contacts, function(item) {
          return item._id = id;
        });
        contacts.splice(indx, 1);
        pub.removed(colIdentity, id);
        console.log('----- Removed: ');
        console.log(id);
        console.log('----- - - Result');
        console.log(contacts);
      }
    };
  };

  var contactsHandle = Contacts.find({}, {
    limit: limit
  }).observeChanges(mergeObserver(function(doc) {
    return {
      type: 'contact',
      name: doc.name,
      _id: doc._id,
      contactId: doc._id,
      ownerId: ownerId
    }
  }));

  var userHandle = Users.find({}, {
    limit: limit
  }).observeChanges(mergeObserver(function(doc) {
    return {
      type: 'user',
      name: doc.profile.fullName,
      _id: doc._id,
      contactId: doc._id,
      ownerId: ownerId
    }
  }));

  pub.ready();

  /**
   * Stop our observers - avoid leakage.
   */
  pub.onStop(function() {
    contactsHandle.stop();
    userHandle.stop();
  });

});
