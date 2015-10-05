'use strict';

Meteor.publish("docwikiPageVersions", function(documentId, pageId) {

	check(documentId, String);
    check(pageId, String);

    return DocwikiPages.find(
        { documentId : documentId, pageId : pageId },
        { sort : { 'version' : -1 } }
    );

});

