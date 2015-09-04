DocwikiIssues = new MultiTenancy.Collection("docwikiIssues");

/*
 * Comments on Pages in the DocWiki
 *
 * @author Mark Leusink
 */

'use strict';

var _issueUserSchema = new SimpleSchema({
  _id: {
    type : SimpleSchema.RegEx.Id
  },
  fullName: {
    type : String
  }
});


Schemas.DocwikiIssues = new MultiTenancy.Schema([ Schemas.IsaBase, {

    issueNo : {
        label : 'Issue no.',
        type : Number
    },
    contents : {
        label : 'Amendment',
        type : String,
        isa: {
            fieldType: 'isaTextarea'
        }
    },
    issueDate : {
        label : 'Issue date',
        type : Date,
        isa: {
            fieldType: 'isaDate'
        }
    },
    authorisedBy : {
        label : 'Authorised by',
        type: _issueUserSchema,
        isa: {
          fieldType: 'isaUser',
          userTypes: ['User']
        }
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
