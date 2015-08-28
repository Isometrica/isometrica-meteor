'use strict';

Meteor.publish("modules", function() {
    return Modules.find({});
});


Meteor.publish('modulesWithPages', function() {
    Meteor.publishWithRelations({
      handle: this,
      collection: Modules,
      filter: {},
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
