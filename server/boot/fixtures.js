
/**
 * @todo Find a nicer way of retaining a handle on the
 * global object ?
 */
var server = this;

/**
 * If we're running in a mirror, expose some useful fixtures methods
 * for our test client
 */
if (process.env.IS_MIRROR) {
  'use strict';
  var tb = Observatory.getToolbox();
  var collections = {
    whitelist: {
      'Users': Meteor.users
    }
  };
  collections.named = function(name) {
    return this.whitelist[name] || server[name];
  };

  /**
   * Publication that returns a cursor bypassing the partitioner
   * for the collection with the given name.
   */
  Meteor.publish("allUsers", function(colName) {
    var cur;
    Partitioner.directOperation(function() {
      cur = collections.named(name).find({});
    });
    return cur;
  });

  Meteor.methods({
    /**
     * Helper - clears the entire db !
     */
    clearDb: function() {
      tb.info('Resetting the database.');
      Meteor.users.remove({});
      Contacts.remove({});
    },
    /**
     * Helper - completely clears a collection with a given name
     *
     * @param name String
     */
    clearCollection: function(name) {
      var col = collections.named(name);
      col.remove({});
    }
  });

}
