'use strict';

Meteor.publish("docwikiPageComments", function(moduleId, parentId) {

	check(moduleId, String);
    check(parentId, String);

    return DocwikiPageComments.find(
        { moduleId : moduleId, parentId : parentId },
        { sort : { 'created.at' : -1 } }
    );

});
