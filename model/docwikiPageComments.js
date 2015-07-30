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
 * TODO for now we allow all actions for all authenticated users
 */

DocwikiPageComments.allow({
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
