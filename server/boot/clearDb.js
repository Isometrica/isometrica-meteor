
/**
 * @todo Find a nicer way of retaining a handle on the
 * global object ?
 */
var server = this;

/**
 * If we're running in a mirror, expose a 'clearDb' method
 * so that we can clear fixture data.
 */
if (process.env.IS_MIRROR) {
  'use strict';
  var tb = Observatory.getToolbox();
  var colWhitelist = {
    'Users': Meteor.users
  };
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
      var col = colWhitelist[name] || server[name];
      col.remove({});
    }
  });
}
