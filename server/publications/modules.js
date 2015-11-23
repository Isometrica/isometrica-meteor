'use strict';

/*
 * Retrieve only modules that:
 * - anyone can edit or read ( allowReadByAll = true or allowEditByAll = true)
 * - the current user's id equals the owner's id
 * - the current user's id is in one of the following arrays:
 *    - readers
 *    - editors
 *    - approvers
 *    - signers
 */

Meteor.publish("modules", function() {

  return Modules.find({ 
    $or : [ 
      { allowEditByAll : true },
      { allowReadByAll : true },
      { 'owner._id' : this.userId },
      { 'readers._id' : this.userId },
      { 'editors._id' : this.userId },
      { 'approvers._id' : this.userId },
      { 'signers._id' : this.userId }
    ]
  }, 
  {
    sort : { title : 1}
  }
  );

});

Meteor.publish("moduleNames", function() {

  return Modules.find({ 
    $or : [ 
      { allowEditByAll : true },
      { allowReadByAll : true },
      { 'owner._id' : this.userId },
      { 'readers._id' : this.userId },
      { 'editors._id' : this.userId },
      { 'approvers._id' : this.userId },
      { 'signers._id' : this.userId }
    ]
  }, 
  {
    fields : { title : 1}
  }
  );

});

