DocwikiPageComments = new MultiTenancy.Collection("docwikiPageComments");

/*
 * Comments on Pages in the DocWiki
 *
 * @author Mark Leusink
 */

'use strict';

Schemas.DocwikiPageComments = new MultiTenancy.Schema([ Schemas.IsaBase, {

 text : {
    type : String,
    max : 500,
   isa: {
     fieldType: 'isaTextarea',
     placeholder: 'Enter your comments here'
   }
 },
 parentId : {
    type : String
 }

}]);

DocwikiPageComments.attachSchema(Schemas.DocwikiPageComments);

/*
 * All authenticated users can add a comment to a page, only editors can change it.
 */

DocwikiPageComments.allow({
    insert: function (userId, doc) {
        return userId;
    },
    update: function (userId, doc, fields, modifier) {
        //only docwiki editors can update
        return _moduleHelpers.isEditor(doc.documentId, userId);
    },
    remove: function (userId, doc) {
        //only docwiki editors can remove
        return _moduleHelpers.isEditor(doc.documentId, userId);
    }
});
