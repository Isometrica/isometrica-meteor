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

        /*
         * Add a signature to the specified page for the current user
         * 
         * @Author Mark Leusink
         */

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

    },

    "getTagOptions" : function(documentId) {

        /*
         * Retrieve an array containing all the tags used in the specified document
         * 
         * @Author Mark Leusink
         */

        check(documentId, String);

         if (!this.userId) {
            throw new Meteor.Error("not-authorized", "You're not authorized to perform this operation");
        }

        var tags = [];

        var tagsList = [];
        var tagsMap = {};

        DocwikiPages.find(
            { documentId : documentId, currentVersion : true},
            { reactive : false, fields : {tags : 1}  } )
        .forEach( function(doc) {
           
            for (var i=0; i<doc.tags.length; i++) {
                tag = doc.tags[i];

                if ( !tagsMap[tag] ) {
                    tagsMap[tag] = tag;
                    tagsList.push( tag );
                }

            }

        });
       
        return tagsList;

    }

});
