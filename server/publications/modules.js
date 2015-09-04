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
  });

});


Meteor.publish('modulesWithPages', function() {
    Meteor.publishWithRelations({
      handle: this,
      collection: Modules,

      filter: { 
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
  
      mappings: [{
        reverse: true,
        key: 'documentId',
        collection: DocwikiPages,
        filter: { inTrash : false, currentVersion : true, $$isaUserId : this.userId },
        options: {
          fields: {documentId : 1, inTrash : 1, currentVersion : 1}
        }
      }]
    });
  });

//publication for a module with related items (pages & issues)

Meteor.publish('module', function(moduleId) {

  check(moduleId, String);

  Meteor.publishWithRelations({
    handle: this,

    collection: Modules,

    filter: {
      $and : [
        { _id : moduleId } ,  
        { $or : [ 
          { allowEditByAll : true },
          { allowReadByAll : true },
          { 'owner._id' : this.userId },
          { 'readers._id' : this.userId },
          { 'editors._id' : this.userId },
          { 'approvers._id' : this.userId },
          { 'signers._id' : this.userId }
        ] }
      ]
    },

    mappings: [
      {
        reverse: true,
        key: 'documentId',
        collection: DocwikiPages,
        filter: { currentVersion : true, $$isaUserId : this.userId },
        options: {
          sort : { 'section' : 1 }
        }
      },
      {
        reverse: true,
        key: 'documentId',
        collection: DocwikiIssues,
        filter: { $$isaUserId : this.userId },
        options: {
          sort : { 'issueNo' : 1 }
        }
      }
    ]
  });
});
