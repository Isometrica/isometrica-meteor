'use strict';

Meteor.publish("docwikiIssues", function(documentId) {

    check(documentId, String);

    return DocwikiIssues.find(
        { documentId : documentId },
        { sort : { 'issueNo' : 1 } }
    );

});
