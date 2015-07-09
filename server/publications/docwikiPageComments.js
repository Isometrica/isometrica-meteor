'use strict';

Meteor.publish("docwikiPageComments", function(pageId) {

    check(pageId, String);

    return DocwikiPageComments.find(
        { pageId : pageId },
        { sort : { 'createdAt' : -1 } }
    );

});
