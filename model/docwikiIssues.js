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
    },
    approvedBy : {
        label : 'Approved by',
        type : [Schemas.IsaUserDoc],
        optional : true
    },
    signedBy : {
        label : 'Signed by',
        type : [Schemas.IsaUserDoc],
        optional : true
    }

}]);

DocwikiIssues.attachSchema(Schemas.DocwikiIssues);

/*
 * Set up access control
 */

DocwikiIssues.allow({
    insert: function (userId, doc) {
        //only the docwiki owner can insert/ update
        return _moduleHelpers.isOwner(doc.documentId, userId);
    },
    update: function (userId, doc, fields, modifier) {
        //only the docwiki owner can insert/ update
        return _moduleHelpers.isOwner(doc.documentId, userId);
    },
    remove: function (userId, doc) {
        //never delete a page: a page can only be moved to the trash
        return false;
    }
});

