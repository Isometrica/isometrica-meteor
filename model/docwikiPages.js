DocwikiPages = new MultiTenancy.Collection("docwikiPages");

/*
 * Pages in the DocWiki
 *
 * @author Mark Leusink
 */

'use strict';

Schemas.DocwikiPages = new MultiTenancy.Schema([ Schemas.IsaBase, {

    section : {
        label : 'Section number',
        type : String,
        max : 50,
        isa : {
            focus: true
        }
    },
    title : {
        label : 'Subject',
        type : String,
        max : 200
    },
    isDraft : {
        label: 'Draft?',
        type : Boolean,
        isa: {
            fieldType: 'isaYesNo'
        }
    },
    documentId : {
        type : String,
        max : 200
    },
    pageId : {
        type : String,
        max : 200,
        optional : true
    },
    version : {
        type : Number,
        optional: true
    },
    contents : {
        type : String,
        optional : true,
        isa: {
            fieldType: 'isaRichText'
        }
    },
    currentVersion : {
        type : Boolean,
        optional : true
    },
    tags : {
        label : 'Tags',
        type : [String],
        optional : true,
        isa: {
            fieldType: 'isaTags'
        }
    },
    signatures : {
        type : [Object],
        optional: true
    },
    'signatures.$.at' : {
        type : Date
    },
    'signatures.$._id' : {
        type : String
    },
    'signatures.$.name' : {
        type : String
    }

}]);

DocwikiPages.attachSchema(Schemas.DocwikiPages);

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
            at : Date.now(),
            _id : this.userId,
            name : Meteor.user().profile.fullName
        };
       
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

    "getTagOptions" : MultiTenancy.method( function(documentId) {

        /*
         * Retrieve an array containing all the tags used in the specified document
         *
         * @Author Mark Leusink
         */

        check(documentId, String);

         if (!this.userId) {
            throw new Meteor.Error("not-authorized", "You're not authorized to perform this operation");
        }

        var tagsList = [];
        var tagsMap = {};

        DocwikiPages.find(
            { documentId : documentId, currentVersion : true, tags : {$exists:true, $not: {$size: 0} }},
            { reactive : false, fields : {tags : 1}  } )
        .forEach( function(doc) {

            for (var i=0; i<doc.tags.length; i++) {
                var tag = doc.tags[i];

                if ( !tagsMap[tag] ) {
                    tagsMap[tag] = tag;
                    tagsList.push( tag );
                }

            }

        });

        return tagsList;

    })

});
