
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
    },

    /**
     * Problem:
     * - Can't operate on a partitioned collection without there being a
     *   logged in user that is part
     *   of a group
     * - For a logged in user to be assigned a group, they must have an
     *   membership with an organisation
     * _ Therefore, for a user to operate on a partitioned collection a
     *   membership must first be
     *   created
     * - Memberships are partitioned
     *
     * Solutions:
     *
     * 1) Don’t partition memberships and enforce our own constraints on
     *    that collection
     * 2) * Create a special test fixture for inserting memberships without
     *    having to be part of a group
     *
     * @param userId String
     * @param orgId  String
     */
    createMembership: function(userId, orgId) {
      console.log('UserId ' + userId + ', orgId ' + orgId);
      Partitioner.directOperation(function() {
        Partitioner.setUserGroup(userId, orgId);
        Memberships.insert({
          userId: userId,
          _groupId: orgId,
          isAccepted: true
        });
      });
    },

    /**
     * Creates an org.
     *
     * @param name String
     */
    createOrganisation: function(name) {
      return Organisations.insert({
        name: name
      });
    }

  });

}
