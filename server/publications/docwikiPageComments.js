'use strict';

Meteor.publish("docwikiPageComments", function(parentId) {

    check(parentId, String);

    return DocwikiPageComments.find(
        { parentId : parentId },
        { sort : { 'createdAt' : -1 } }
    );

});
