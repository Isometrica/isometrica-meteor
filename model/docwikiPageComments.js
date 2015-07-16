DocwikiPageComments = new Mongo.Collection("docwikiPageComments");

/*
 * Comments on Pages in the DocWiki
 *
 * @author Mark Leusink
 */

'use strict';

Schemas.DocwikiPageComments = new SimpleSchema([ Schemas.IsaBase, {
 
 text : {
    label : 'Comment',
    type : String,
    max : 500 
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