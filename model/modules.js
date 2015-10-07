/*
 * Modules in Isometrica
 *
 * @author Mark Leusink
 */

Modules = new MultiTenancy.Collection("modules");

/*
 * helper functions for the Modules collection
 *
 * @author Mark Leusink
 */
_moduleHelpers = {

  getUserSchema : function() {
    //returns a simple schema that can be used for user docs

    return new SimpleSchema({
      _id: {
        type : SimpleSchema.RegEx.Id
      },
      fullName: {
        type : String
      }
    });
  },

  isOwner : function(moduleId, userId) {
    //check if the specified user is an owner in a module

    if (!userId) { return false; }

    var module = Modules.findOne( { _id : moduleId });

    return (module.owner._id === userId);

  },

  isReader : function(moduleId, userId) {
    //check if the specified user is an reader in a module

    if (!userId) { return false; }

    var module = Modules.findOne( { _id : moduleId });
    var isOwner = (module.owner._id === userId);

    if (isOwner || module.allowEditByAll || module.allowReadByAll) {    //owner can always read
      return true;
    }

    if (_isIdInList( userId, module.editors || [])) { return true; }
    if (_isIdInList( userId, module.readers || [])) { return true; }
    if (_isIdInList( userId, module.approvers || [])) { return true; }
    if (_isIdInList( userId, module.signers || [])) { return true; }

    return false;
  },

  _isIdInList : function(userId, list) {
    var found = false;
    for (var i=0; i<list.length && !found; i++) {
        found = (list[i]._id === userId);
    }
    return found;
  },

  isEditor : function(moduleId, userId) {
    //check if the specified user is an editor in a module

    if (!userId) { return false; }

    var module = Modules.findOne( { _id : moduleId });
    var isOwner = (module.owner._id === userId);

    if (isOwner || module.allowEditByAll) {    //owner can always edit
      return true;
    }

    if (_isIdInList( userId, module.editors || [])) { return true; }

    return false;
  },

  documentApproved : function(issueId, docWiki, signLink, openLink) {

    var docId = docWiki._id;
    var docApprovers = docWiki.approvers;
    var docSigners = docWiki.signers;
    var docTitle = docWiki.title;
    var orgId = docWiki._orgId;

    //check if all approvers have approved this document
    var issue = DocwikiIssues.findOne( { _id : issueId}, { fields : {approvedBy : true}});

    var allApproved = true;
    for (var i=0; i<docApprovers.length && allApproved; i++) {
      var approver = docApprovers[i];

      if ( !_helpers.isUserMemberOf( issue.approvedBy, approver._id)) {
        allApproved = false;
      }

    }

    if (allApproved) {

      //change docwiki status to approved
      Modules.update( { _id : docId}, { $set : { status : 'approved'} }, function() {

        //notify the owner that the document has been approved
         Meteor.call("sendToInboxById", "docwiki/email/docapproved", docWiki.owner._id, {
              title : docTitle,
              currentUser : Meteor.user().profile.fullName,
              pageLink : openLink
          }, orgId);

        //doc is now approved: send a notification to all doc signers
        if (docSigners && docSigners.length) {

          var signerIds = [];
          for (var i=0; i<docSigners.length; i++) {
            signerIds.push( docSigners[i]._id );
          }

          Meteor.call("sendToInboxById", "docwiki/email/signdoc", signerIds, {
              title : docTitle,
              currentUser : Meteor.user().profile.fullName,
              pageLink : signLink
          }, orgId);

        }

      });

    }
  }



};

Schemas.Module = new MultiTenancy.Schema([Schemas.IsaBase, {
  orgName : {         /* name of the organisation to which this document belongs */
    type: String,
    optional: true
  },
  isTemplate: {       /* indicates is this document is a template */
    type: Boolean,
		defaultValue: false
  },
  templateId : {      /* reference to the _id of the original document (when inserting from a template) */ 
    type: String,
    optional: true
  },
  isArchived: {
    type: Boolean,
    defaultValue: false
  },
  archivedAt: {
    type: Date,
    optional: true
  },
  title: {
    label: 'Title',
    type: String,
    isa : {
      focus : true
    }
  },
  type: {
    type: String
  },
  owner : {
    type: _moduleHelpers.getUserSchema(),
    label: 'Document owner',
    isa: {
      fieldType: 'isaUser'
    }
  },
  description: {
    label: 'Description',
    type: String,
    optional: true,
    isa: {
     fieldType: 'isaTextarea',
     placeholder: 'Enter a description'
    }
  },
  approvalMode : {
    label : 'Document control mode',
    type : String,
    optional: true,
    autoValue: function() {
        if (this.isInsert) {
            return 'automatic';
        }
    },
    isa: {
        fieldType: 'isaToggle',
        fieldChoices : [{'label': 'Automatic', 'value' : 'automatic'}, {'label' : 'Manual', 'value' : 'manual'}]
    }
  },
  status : {
    label : 'Status',
    type : String,    /* approved / not-approved */
    optional : true
  },
  approvers : {
    label : 'Approvers',
    type : [_moduleHelpers.getUserSchema()],
    optional: true,
    isa: {
      fieldType: 'isaUser',
      selectMultiple : true,
      placeholder : 'Select one or more approvers'
    }
  },
  signers : {
    label : 'Signers',
    type : [_moduleHelpers.getUserSchema()],
    optional: true,
    isa: {
      fieldType: 'isaUser',
      selectMultiple : true,
      placeholder : 'Select one or more signers'
    }
  },
  readers : {
    label : 'Readers',
    type : [_moduleHelpers.getUserSchema()],
    optional: true,
    isa: {
      fieldType: 'isaUser',
      selectMultiple : true,
      placeholder : 'Select one or more readers'
    }
  },
  editors : {
    label : 'Editors',
    type : [_moduleHelpers.getUserSchema()],
    optional: true,
    isa: {
      fieldType: 'isaUser',
      selectMultiple : true,
      placeholder : 'Select one or more editors'
    }
  },

  allowEditByAll : {
    label : 'Anyone can edit?',
    type: Boolean,
    isa: {
      fieldType: 'isaYesNo'
    },
    autoValue: function() {
        if (this.isInsert) {
            return true;
        }
    }
  },
  allowReadByAll : {
    label : 'Anyone can read?',
    type: Boolean,
    isa: {
      fieldType: 'isaYesNo'
    },
    autoValue: function() {
        if (this.isInsert) {
            return true;
        }
    }
  },
  lifetimeYears : {
    label : 'Document lifetime (years)',
    type: Number,
    autoValue: function() {
        if (this.isInsert) {
            return 4;
        }
    }
  },
  reviewFreqMonths : {
    label : 'Document Review/ Approval frequency (months)',
    type: Number,
    autoValue: function() {
        if (this.isInsert) {
            return 6;
        }
    }
  },
  reviewExpiryRemindersDays : {
    label : 'Document approval expiry reminders (days)',
    type: Number,
    autoValue: function() {
        if (this.isInsert) {
            return 7;
        }
    }
  },
  numPages : {
    label : 'Number of pages',
    type : Number,
    optional : true,
    autoValue : function() {
      if (this.isInsert && !this.isSet) { return 0; }
    }
  }

}]);

Modules.attachSchema(Schemas.Module);

Modules.after.insert( function(userId, doc) {
  
  //create the first default issue in the module
  if (doc.type == 'docwiki') {
    DocwikiIssues.insert( {
      documentId : doc._id,
      _orgId : doc._orgId,
      contents : '-',
      issueDate : new Date(),
      authorisedBy : doc.owner,
      approvedBy : [],
      signedBy : []
    });

  }  

});

Modules.allow({
    insert: function (userId, doc) {
        //allow only for users that can create documents
        var membership = Memberships.findOne({ userId : userId });
        return membership.canCreateDocuments;
    },
    update: function (userId, doc, fields, modifier) {
        //only the owner of a module can update its settings
        var isOwner = (doc.owner._id === userId);
        return userId && isOwner;
    },
    remove: function (userId, doc) {
        //a module can never be deleted: only moved to the trash
        return false;
    }
});

Meteor.methods( {

    /* mark an issue in the specified docWiki as approved by the current user*/
    "approveDocWiki" : MultiTenancy.method( function(moduleId, issueId, signLink, openLink) {

      check(moduleId, String);
      check(issueId, String);
      check(signLink, String);
      check(openLink, String);

      if (!this.userId) {
        return 'not-authorized';
      }

      //check if the user is allowed to sign
      var docWiki = Modules.findOne( { _id : moduleId });

      if ( !this.userId == docWiki.owner._id && !_helpers.isUserMemberOf(docWiki.approvers, this.userId )) {
        return 'not-authorized';
      }

      var approver = {_id : this.userId, fullName : Meteor.user().profile.fullName};

      var issue = DocwikiIssues.findOne( { _id : issueId });

      if ( _helpers.isUserMemberOf(issue.approvedBy, this.userId )) {
        //user already approved the document
        return 'already-approved';
      }

      //sign the issue
      DocwikiIssues.update( { _id : issueId }, { $push : { approvedBy : approver  }}, function() {
        _moduleHelpers.documentApproved( issueId, docWiki, signLink, openLink);
      });

      return 'approved';


    } ),

    /* sign a docwiki */
    "signDocWiki" : MultiTenancy.method( function(moduleId, issueId) {

      check(moduleId, String);
      check(issueId, String);

      if (!this.userId) {
        return 'not-authorized';
      }

      //check if the user is allowed to sign
      var docWiki = Modules.findOne( { _id : moduleId });

      if ( !this.userId == docWiki.owner._id && !_helpers.isUserMemberOf(docWiki.signers, this.userId )) {
        return 'not-authorized';
      }

      var signer = {_id : this.userId, fullName : Meteor.user().profile.fullName};

      var issue = DocwikiIssues.findOne( { _id : issueId });

      if ( _helpers.isUserMemberOf(issue.signedBy, this.userId )) {
        //user already signed the document
        return 'already-signed';
      }

      //sign the issue
      DocwikiIssues.update( { _id : issueId }, { $push : { signedBy : signer  }}, function() {
      });

      return 'signed';


    } ),

    "copyDocWiki" : MultiTenancy.method( function(moduleId, title, copyAsTemplate) {

    	/*
    	 * Copy an entire document, set the updated title, remove the template flag (if 'copyAsTemplate' = true)
       * 
       * This function is called to (1) duplicate a document or (2) insert a document from a template
    	 */

    	  check(moduleId, String);
        check(title, String);
        check(copyAsTemplate, Boolean);

        if (!this.userId) {
            throw new Meteor.Error("not-authorized", "You're not authorized to create documents (error code 1)");
        }

        var currentOrgId = arguments[arguments.length-1];
        var org = Organisations.findOne( { _id : currentOrgId });
        var currentOrgName = org.name;

        var sourceDocWiki = Modules.findOne(moduleId);

        if (copyAsTemplate) {

          //check if the user is allowed to create documents
          var membership = Memberships.findOne( { userId : this.userId });

          if (!membership) {
            throw new Meteor.Error("not-authorized", "You're not authorized to create documents (error code 2)");
          }

          if (!membership.canCreateDocuments) {
            throw new Meteor.Error("not-authorized", "You're not authorized to create documents (error code 4)");
          }

        } else {

          //check if the user is allowed to duplicate (allowed for the owner only)
          if ( this.userId != sourceDocWiki.owner._id) {
              throw new Meteor.Error("not-authorized", "You're not authorized to create documents (error code 3)");
          }

        }

        var newOwner = {
          _id : this.userId,
          fullName : Meteor.user().profile.fullName
        };
        
      	copyHelpers.copyDocument(sourceDocWiki, title, copyAsTemplate, org, newOwner);

      	return sourceDocWiki;

    }),

    /* 
     * Replace a text in all pages in a docwiki
     *
     * @author Mark Leusink
    */

    "findAndReplace" : function(moduleId, query, replaceBy) {

        check(moduleId, String);
        check(query, String);
        check(replaceBy, String);

        if (!this.userId) {
            throw new Meteor.Error("not-authorized", "You're not authorized to perform this operation");
        }

        //check if the user is allowed to edit
        if ( !_moduleHelpers.isEditor(moduleId, this.userId) ) {
          throw new Meteor.Error("not-authorized", "You're not authorized to perform this operation");
        }
        
        //loop through all pages, check if it contains the specified string in the title or contents
        //and replace it
        DocwikiPages.find( { documentId : moduleId} ).forEach( function(page) {

          var found = false;
          var newContents = page.contents;
          var newTitle = page.title;

          if (page.contents && page.contents.indexOf(query)>-1 ) {
            newContents = newContents.replace(query, replaceBy);
            found = true;
          }
          if (page.title && page.title.indexOf(query)>-1 ) {
            newTitle = newTitle.replace(query, replaceBy);
            found = true;
          }

          if (found) {

            //mark current page as non-current
            DocwikiPages.update( { _id : page._id}, { $set : { currentVersion: false } }, function(err, numUpdated) {

              if (err) {
                throw new Meteor.Error("not-updated", "An error occurred");
              }

              //create a new page
              var newPage = page;
              delete newPage['_id'];
              newPage.contents = newContents;
              newPage.title = newTitle;
              newPage.currentVersion = true;
              newPage.version = page.version + 1;

              console.log(newPage);

              DocwikiPages.insert( newPage, function(err, _id) {
                console.log('new page inserted as ', _id);

              });

            } );

          }

        });

        return "ok";

    },

    /*
     * Method to create a new 'module' on the Overview. Can be either a Document or Workbook.
     *
     * @author Mark Leusink
     *
     * TODO: creating documents should be done by selecting a Smart Template. There will be a smart template
     * that is completly 'blank' to start from
     */

    "createModule" : MultiTenancy.method ( function(module) {

      //set defaults
      module.isTemplate = false;
      module.isArchived = false;
      module.inTrash = false;
      module.owner = {
        _id : this.userId,
        fullName : Meteor.user().profile.fullName
      };

      //clean and validate data
      Schemas.Module.clean(module, { extendAutoValueContext : {
        isInsert : true
      }});

      var c = Schemas.Module.namedContext("addModule");

      if (c.validate(module) ) {

        Modules.insert( module, function(err, _id) {
          if (err) {
            return { 'error' : err};
          }

          return _id;
        } );

      } else {

        return { 'error' : 'invalid data'};
      }

    })

} );

var copyHelpers = {};

/*
 * Duplicates a DocWiki, including all pages and attached files
 */
copyHelpers.copyDocument = function(sourceDocWiki, title, copyAsTemplate, org, newOwner) {

	var sourceDocId = sourceDocWiki._id;

	//update properties for the copied docwiki
	delete sourceDocWiki['_id'];

  sourceDocWiki.title = title;
	sourceDocWiki.created.at = new Date();
	sourceDocWiki.modified.at = new Date();
  sourceDocWiki._orgId = org._id;
  sourceDocWiki.orgName = org.name;
  sourceDocWiki.owner = newOwner;

  if (copyAsTemplate) {
    sourceDocWiki.isTemplate = false;
    sourceDocWiki.templateId = sourceDocId;
  }

	Modules.insert( sourceDocWiki, function(err, _id) {

		var targetDocId = _id;
    var newTitle = sourceDocWiki.title;
    
    var replaceVars = {
      '{organisation-name}' : org.name
    };

		copyHelpers.copyPages(sourceDocId, targetDocId, newTitle, replaceVars);

	} );

};

/*
 * Finds all pages belonging to the document with the specified sourceDocId,
 * copy them and attach to the specified document.
 *
 * @param cb optional callback function that will be executed after copying
 *
 * @author Mark Leusink
 *
 * @param sourceDocId	ID of the document from which to copy all pages
 * @param targetDocId	ID of the document to give all copied pages
 * @param newTitle		Updated title
 *
 */
copyHelpers.copyPages = function(sourceDocId, targetDocId, newTitle, replaceVars) {

	//loop through all pages found
	DocwikiPages.find( { documentId : sourceDocId} ).forEach( function(page) {

		var sourcePageId = page._id;

		//remove the id: we let the system create a new one
		delete page['_id'];
		page.created.at = new Date();
		page.modified.at = new Date();

		//set the parent (document) id to the newly created document
		page.documentId = targetDocId;

    //replace variables
    for (var key in replaceVars) {

      if (page.hasOwnProperty('contents') ) { 
        page.contents = page.contents.replace(key, replaceVars[key]);
      }
      if (page.hasOwnProperty('title') ) {
        page.title = page.title.replace(key, replaceVars[key]);
      }

    }

		//clear signatures
		page.signedBy = [];

		DocwikiPages.insert( page, function(err, _id) {

		});

	});

};
