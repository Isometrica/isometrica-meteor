DocwikiPages = new MultiTenancy.Collection("docwikiPages");

/*
 * Pages in the DocWiki
 *
 * @author Mark Leusink
 */

'use strict';

_docWikiPagesHelpers = {

  updateNumPages : function(docId) {

    //update number of pages in the module
    if (Meteor.isServer) {
        var numPages = DocwikiPages.find( { documentId : docId, currentVersion : true, inTrash : false } ).count();
        Modules.update( { _id : docId }, { $set : { numPages : numPages } }, function(err, numUpdated) {
            if (err) { 
                console.error("could not update page count in module " + docId );
                console.error(err);
            }
            if (numUpdated == 0) { 
                console.error("could not update page count in module " + docId );
            }
        }); 
    }

  }

};

Schemas.IsaIsoClauseReference = new SimpleSchema({
  documentRef : {
    label : 'Document reference',
    type : 'String'
  },
  clauseNumbers : {
    label : 'Clause number(s)',
    type : 'String'
  }
});

Schemas.DocwikiPages = new MultiTenancy.Schema([ Schemas.IsaBase, {

    section : {
        label : 'Section number',
        type : String,
        max : 50,
        autoValue : function(doc) {

            if (this.isSet) {

                /* For sorting purposes, we'll have to parse the section number:
                 * every section components (i.e. 1.2 has 2 components) gets 2 leading
                 * zeros: 001.002. These are removed when displaying the section no in the front end.
                 */

                if (this.value.indexOf('.')>-1) {

                    var comps = this.value.split('.');
                    for (var i=0; i<comps.length; i++) {
                        var t = comps[i];

                        if ( t.length>0 && !isNaN(t) ) {
                            var n = '00' + parseInt(t, 10);
                            comps[i] = n.substr(n.length-3);
                        }
                    }

                    return comps.join('.');
                } else {

                    if (!isNaN(this.value) ) {
                        var n = '00' + parseInt(this.value, 10);
                        return n.substr(n.length-3);
                    }
                  
                    return this.value;
                }

            }

        },
        isa : {
            focus: true
        }
    },
    title : {
        label : 'Section title',
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
    documentId : {          /* id of the document to which this page belongs */
        label : 'Document ID',
        type : String,
        max : 200
    },
    pageId : {              /*i d of this page (to keep track of multiple versions) */
        type : String,
        autoValue : function(doc) {
            if (this.isInsert && !this.isSet) {
                return Random.id();
            }
        }
    },
    version : {  
        type : Number,
        autoValue : function(doc) {
            if (this.isInsert && !this.isSet) {
                return 1;
            }
        }
    },
    currentVersion : {      /* indicates if this page (within the collection of all pages with */
                            /* the same pageId) is unique */
        type : Boolean,
        autoValue : function(doc) {
            if (this.isInsert && !this.isSet) {
                return true;
            }
        }
    },
    contents : {
        type : String,
        optional : true,
        isa: {
            fieldType: 'isaRichText'
        }
    }, 
    tags : {
        label : 'Tags',
        type : [String],
        optional : true,
        isa: {
            fieldType: 'isaTags'
        }
    },
    signedBy : {
        type : [Schemas.IsaUserDoc],
        optional: true
    },
    approvedBy : {
        type : [Schemas.IsaUserDoc],
        optional: true
    },
    isoClauses : {
        label : "Document reference(s)",
        type : [Schemas.IsaIsoClauseReference],
        optional : true
    },
    guidanceSubject : {
        label : "Primary guidance text",
        type : String,
        optional: true
    },
    guidanceContents : {
        label : "Secondary guidance text",
        type : String,
        optional: true
    },
    guidanceHelpUrl : {
        label : "Help URL",
        type : String,
        optional: true
    }

}]);

DocwikiPages.attachSchema(Schemas.DocwikiPages);

DocwikiPages.after.insert( function(userId, doc) {
    _docWikiPagesHelpers.updateNumPages(doc.documentId);
});

DocwikiPages.after.update( function(userId, doc) {
    _docWikiPagesHelpers.updateNumPages(doc.documentId);
});

DocwikiPages.after.remove( function(userId, doc) {
     _docWikiPagesHelpers.updateNumPages(doc.documentId);
});

/*
 * Set up access control for the DocWiki
 */

DocwikiPages.allow({
    insert: function (userId, doc) {
        //only editors can insert/ update
        return _moduleHelpers.isEditor(doc.documentId, userId);
    },
    update: function (userId, doc, fields, modifier) {
        if ( _helpers.isDeleteUpdate(fields, modifier) ) {
            //only an owner can 'delete' a document
            return _moduleHelpers.isOwner(doc.documentId, userId);
        }

        //only editors can insert/ update
        return _moduleHelpers.isEditor(doc.documentId, userId);
    },
    remove: function (userId, doc) {
        //never delete a page: a page can only be moved to the trash
        return false;
    }
});

Meteor.methods( {

    "signPage" : MultiTenancy.method( function(pageId) {


        /*
         * Add a signature to the specified page for the current user
         *
         * @Author Mark Leusink
         */

        check(pageId, String);

        if (!this.userId) {
            throw new Meteor.Error("not-authorized", "You're not authorized to perform this operation");
        }

        var page = DocwikiPages.findOne( { _id: pageId});

        if ( _helpers.isUserMemberOf(page.signedBy, this.userId )) {
            //user already signed the document
            return 'already-signed';
        }

        var signature = {
            at : new Date(),
            _id : this.userId,
            fullName : Meteor.user().profile.fullName
        };
       
        //get the Page and add the signature
        DocwikiPages.update(
            { _id : pageId},
            { $push : { signedBy : signature } },

            function(err, res) {

                if (err) {
                    throw new Meteor.Error(err);
                }

            });

        return "signed";

    }),

    "approvePage" : MultiTenancy.method( function(pageId, signLink) {


        /*
         * Add a signature to the specified page for the current user
         *
         * @Author Mark Leusink
         */

        check(pageId, String);

        if (!this.userId) {
            throw new Meteor.Error("not-authorized", "You're not authorized to perform this operation");
        }

        var page = DocwikiPages.findOne( { _id: pageId});

        if ( _helpers.isUserMemberOf(page.approvedBy, this.userId )) {
            //user already approved the document
            return 'already-approved';
        }

        var signature = {
            at : new Date(),
            _id : this.userId,
            fullName : Meteor.user().profile.fullName
        };
       
        //get the Page and add the signature
        DocwikiPages.update(
            { _id : pageId},
            { $push : { approvedBy : signature } },

            function(err, res) {

                if (err) {
                    throw new Meteor.Error(err);
                }

                //check if all approvers have approved the page: set page to 'published' if true
                var page = DocwikiPages.findOne( { _id: pageId});
                var docWiki = Modules.findOne( { _id : page.documentId });

                var pageTitle = page.title;
                var docTitle = docWiki.title;
                var docApprovers = docWiki.approvers || [];
                var docSigners = docWiki.signers || [];
                docApprovers.push( docWiki.owner);      //add the owner

                var allApproved = true;
                for (var i=0; i<docApprovers.length && allApproved; i++) {
                  var approver = docApprovers[i];

                  if ( !_helpers.isUserMemberOf( page.approvedBy, approver._id)) {
                    allApproved = false;
                  }

                }

                if (allApproved) {

                    //mark page as published
                    DocwikiPages.update(
                    { _id : pageId},
                    { $set : { isDraft : false } }, 

                    function(err, res) {

                        //doc is now approved: send a notification to all doc signers
                        if (docSigners.length) {

                            var signerIds = [];
                            for (var i=0; i<docSigners.length; i++) {
                              signerIds.push( docSigners[i]._id );
                            }

                            Meteor.call("sendToInboxById", "docwiki/email/page/sign", signerIds, {
                                title : docTitle,
                                currentUser : Meteor.user().profile.fullName,
                                pageTitle : pageTitle,
                                pageLink : signLink
                            }, docWiki._orgId);

                        }

                    });

                }
             
            }
        );

        return "approved";      //TODO: why can't we return this in the callback?

    }),

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
