/*
 * Pages in the DocWiki
 *
 * @author Mark Leusink
 */

DocwikiPages = new Mongo.Collection("docwikiPages");

DocwikiPages.before.insert(function (userId, doc) {
    doc.createdAt = Date.now();
    doc.createdBy = userId;
    doc.modifiedAt = Date.now();
    doc.modifiedBy = userId;
    doc.inTrash = false;
});

DocwikiPages.before.update(function (userId, doc) {
    doc.modifiedAt = Date.now();
    doc.modifiedBy = userId;
});

DocwikiPages.after.insert( function(userId, doc) {

    /*
     * If a page is added and it is the 1st version: set the pageId to the page's _id.
     * The pageId field is used to be able to find all versions of the same page
     */
    if (!doc.hasOwnProperty('pageId')) {
        DocwikiPages.update({_id: doc._id}, {$set: {pageId: doc._id}});
    }
});

/*
 * TODO for now we allow all actions for all authenticated users
 */

DocwikiPages.allow({
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