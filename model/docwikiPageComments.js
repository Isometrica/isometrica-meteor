DocwikiPageComments = new Mongo.Collection("docwikiPageComments");

/*
 * Comments on Pages in the DocWiki
 *
 * @author Mark Leusink
 */

'use strict';

DocwikiPageComments.before.insert(function (userId, doc) {
    doc.createdAt = Date.now();
    doc.createdBy = userId;
    doc.modifiedAt = Date.now();
    doc.modifiedBy = userId;
    doc.inTrash = false;
});

DocwikiPageComments.before.update(function (userId, doc) {
    doc.modifiedAt = Date.now();
    doc.modifiedBy = userId;
});

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