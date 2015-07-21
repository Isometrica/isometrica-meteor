DocwikiIssues = new Mongo.Collection("docwikiIssues");

/*
 * Comments on Pages in the DocWiki
 *
 * @author Mark Leusink
 */

'use strict';


Schemas.DocwikiIssues = new SimpleSchema([ Schemas.IsaBase, {

    issueNo : {
        label : 'Issue no.',
        type : Number
    },
    contents : {
        label : 'Amendment',
        type : String
    },
    issueDate : {
        label : 'Issue date',
        type : Date
    },
    authorisedBy : {
        label : 'Authorised by',
        type : String
    },
    documentId : {
        type : String
    }

}]);

DocwikiIssues.attachSchema(Schemas.DocwikiIssues);

/*
 * TODO for now we allow all actions for all authenticated users
 */

DocwikiIssues.allow({
    insert: function (userId, doc) {
        return userId;
    },
    update: function (userId, doc, fields, modifier) {
        return userId;
    },
    remove: function (userId, party) {
        return userId;
    }
});