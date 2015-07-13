'use strict';

Meteor.publish("docwikiPages", function(documentId) {

    check(documentId, String);

    return DocwikiPages.find(
        { documentId : documentId, currentVersion : true},
        { sort : { 'section' : 1 } }
    );

});

Meteor.publish("docwikiPageVersions", function(pageId) {

    check(pageId, String);

    return DocwikiPages.find(
        { pageId : pageId },
        { sort : { 'version' : -1 } }
    );

});

