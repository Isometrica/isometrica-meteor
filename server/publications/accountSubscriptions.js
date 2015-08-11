'use strict';

Meteor.publish("accountSubscriptions", function() {
  return AccountSubscriptions.find({
    'owner._id': this.userId
  });
});

/**
 * Publish the organisations that the current user is exclusively an
 * owner of and their active modules. The client side uses this to
 * determine the number of modules that an account 'owns'.
 *
 * @author Steve Fortune
 */
Meteor.publish("accountModules", function() {
  Meteor.publishWithRelations({
    handle: this,
    collection: Organisations,
    filter: {
      'owner._id': this.userId
    },
    mappings: {
      key: '_orgId',
      reverse: true,
      collection: Modules
    }
  });
});
