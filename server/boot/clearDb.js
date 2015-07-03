
/**
 * If we're running in a mirror, expose a 'clearDb' method
 * so that we can clear fixture data.
 */
if (process.env.IS_MIRROR) {
  'use strict';
  var tb = Observatory.getToolbox();
  var clearDb = function() {
    tb.info('Resetting the database.');
    Meteor.users.remove({});
    Contacts.remove({});
  };
  Meteor.methods({
    clearDb: clearDb
  });
}
