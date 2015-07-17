
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
   *
   * @param colNames  String | Array
   */
  Meteor.publish("all", function(colNames) {
    var curs = [];
    Partitioner.directOperation(function() {
      if (typeof colNames === 'object') {
        curs = colNames.map(function(name) {
          return collections.named(name).find({});
        });
      } else {
        curs = collections.named(colNames).find({});
      }
    });
    return curs;
  });

  Meteor.methods({

    /**
     * Helper - clears the entire db !
     */
    clearDb: function() {
      tb.info('Resetting the database.');
      Meteor.users.remove({});
    },

    /**
     * Helper - completely clears a collection with a given name
     *
     * @param name String | Array
     */
    clearCollection: function(colNames) {
      Partitioner.directOperation(function() {
        if (typeof colNames === 'object') {
            colNames.forEach(function(name) {
              collections.named(name).remove({});
            });
        } else {
          collections.named(colNames).remove({});
        }
      });
    }

  });

}
