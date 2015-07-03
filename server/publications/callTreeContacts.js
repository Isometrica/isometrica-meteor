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
      },
      removed: function(id) {
        var indx = indexOf(contacts, function(item) {
          return item._id = id;
        });
        contacts.splice(indx, 1);
        pub.removed(colIdentity, id);
      }
    };
  };

  /**
   * @param doc       Object
   * @param type      String
   * @param nameParam String
   * @return Object
   */
  var buildNode = function(doc, type, nameParam) {
    console.log('Transforming');
    console.log(doc);
    var id = doc._id;
    return {
      type: type,
      name: nameParam,
      _id: id,
      contactId: id,
      ownerId: ownerId
    };
  };

  var contactsHandle = Contacts.find({}, {
    limit: limit,
    fields: {
      _id: 1,
      name: 1
    }
  }).observeChanges(mergeObserver(function(doc) {
    return buildNode(doc, 'contact', doc.name);
  }));

  var userHandle = Users.find({}, {
    limit: limit,
    fields: {
      _id: 1,
      profile: 1
    }
  }).observeChanges(mergeObserver(function(doc) {
    var name = doc.profile.firstName + ' ' + doc.profile.lastName;
    return buildNode(doc, 'user', name);
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
