DocwikiPages = new Mongo.Collection("docwikiPages");

/*
 * Pages in the DocWiki
 *
 * @author Mark Leusink
 */

'use strict';

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

        DocwikiPages.update({_id: doc._id}, {$set: {version : 1, pageId: doc._id, currentVersion : true}});
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

Meteor.methods( {

    "signPage" : function(id) {

        check(id, String);

        if (!this.userId) {
            throw new Meteor.Error("not-authorized", "You're not authorized to perform this operation");
        }

        //TODO: who can call this function

        var signature = {
            createdAt : Date.now(),
            createdBy : this.userId
        };
        //TODO: set name in createdBy (or full user)

        //get the Page and add the signature
        DocwikiPages.update(
            { _id : id},
            { $push : { signatures : signature } },

            function(err, res) {

                if (err) {
                    throw new Meteor.Error(err);
                }

                return "success";

            });

    }


});
