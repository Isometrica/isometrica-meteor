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
     focus : true,
     fieldType: 'isaTextarea',
     placeholder: 'Enter your comments here'
    }
 },
 parentId : {
    type : String
 },
 moduleId : {
    type : String
 }

}]);

DocwikiPageComments.attachSchema(Schemas.DocwikiPageComments);

/*
 * All document readers can add a comment to a page, only document editors can change it.
 */

DocwikiPageComments.allow({
    insert: function (userId, doc) {
        return _moduleHelpers.isReader(doc.moduleId, userId);
    },
    update: function (userId, doc, fields, modifier) {
        //only docwiki editors can update
        return _moduleHelpers.isEditor(doc.moduleId, userId);
    },
    remove: function (userId, doc) {
        //only docwiki editors can remove
        return _moduleHelpers.isEditor(doc.moduleId, userId);
    }
});
