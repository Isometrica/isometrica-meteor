
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

  var colWhitelist = {
    'Users': Meteor.users
  };
  var collectionNamed = function(name) {
    return colWhitelist[name] || server[name];
  };

  /**
   * Publication that returns a cursor bypassing the partitioning
   * for the collection with the given name.
   *
   * @param colNames  String | Array
   */
  Meteor.publish("all", function(colNames) {
    var curs = [];
    if (_.isObject(colNames)) {
      curs = colNames.map(function(name) {
        return collectionNamed(name).direct.find({});
      });
    } else {
      curs = collectionNamed(colNames).direct.find({});
    }
    return curs;
  });

  Meteor.methods({

    /**
     * Helper - completely clears a collection with a given name
     *
     * @param name String | Array
     */
    removeAll: function(colNames) {
      if (_.isObject(colNames)) {
          colNames.forEach(function(name) {
            collectionNamed(name).direct.remove({});
          });
      } else {
        collectionNamed(colNames).direct.remove({});
      }
    },

  });

}
