'use strict';

Meteor.publish("docwikiPageVersions", function(pageId) {

    check(pageId, String);

    return DocwikiPages.find(
        { pageId : pageId },
        { sort : { 'version' : -1 } }
    );

});

