CallTreeNode = new Mongo.Collection("callTreeNode");

'use strict';

/**
 * @note In future there will be more complex access control here..
 */
CallTreeNode.allow({
  remove: function() {
    return true;
  }
});

Meteor.methods({

  /**
   * Add a new node for the user of a given id.
   *
   * @todo Validation
   * @todo Check that the node doesn't already exist for the user
   * @todo Check that the node isn't _for_ the user
   * @todo Check that the user exists
   */
  add: function(userId, node) {
    CallTreeNode.insert(_.extend(node, {
      owner: userId
    }));
  }

});
