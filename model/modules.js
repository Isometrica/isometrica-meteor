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

  isEditor : function(moduleId, userId) {
    //check if the specified user is an editor in a module

    if (!userId) { return false; }

    var module = Modules.findOne( { _id : moduleId });
    var isOwner = (module.owner._id === userId);
    
    if (isOwner || module.allowEditByAll) {    //owner can always edit
      return true;
    }
       
    var isEditor = false;

    var editors = module.editors || [];
    for (var i=0; i<editors.length && !isEditor; i++) {
        isEditor = (editors[i]._id === userId);
    }

    return isEditor;
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
  isTemplate: {
    type: Boolean,
		defaultValue: false
  },
  isArchived: {
    type: Boolean,
    defaultValue: false
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
      fieldType: 'isaUser',
      userTypes: ['User']
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
    label : 'Page approval mode',
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
    label : 'Document approvers',
    type : [_moduleHelpers.getUserSchema()],
    optional: true,
    isa: {
      fieldType: 'isaUser',
      selectMultiple : true,
      placeholder : 'Select one or more approvers',
      userTypes: ['User']
    }
  },
  signers : {
    label : 'Document signers',
    type : [_moduleHelpers.getUserSchema()],
    optional: true,
    isa: {
      fieldType: 'isaUser',
      selectMultiple : true,
      placeholder : 'Select one or more signers',
      userTypes: ['User']
    }
  },
  readers : {
    label : 'Document readers',
    type : [_moduleHelpers.getUserSchema()],
    optional: true,
    isa: {
      fieldType: 'isaUser',
      selectMultiple : true,
      placeholder : 'Select one or more readers',
      userTypes: ['User']
    }
  },
  editors : {
    label : 'Document editors',
    type : [_moduleHelpers.getUserSchema()],
    optional: true,
    isa: {
      fieldType: 'isaUser',
      selectMultiple : true,
      placeholder : 'Select one or more editors',
      userTypes: ['User']
    }
  },

  allowEditByAll : {
    label : 'Anyone can edit this document',
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
    label : 'Anyone can read this document',
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
  }

}]);

Modules.attachSchema(Schemas.Module);

/*
 * TODO for now we allow all actions for authenticated users only
 */

Modules.allow({
    insert: function (userId, doc) {
        //every authenticated user can create a module
        return userId;
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
//        _moduleHelpers.documentSigned( issueId, docWiki);
      });

      return 'signed';


    } ),

    "copyDocWiki" : function(moduleId) {

    	/*
    	 * Copy an entire document
    	 */

    	check(moduleId, String);

         if (!this.userId) {
            throw new Meteor.Error("not-authorized", "You're not authorized to perform this operation");
        }

        var docWiki = Modules.findOne(moduleId);

      	copyHelpers.copyDocument(docWiki);

      	return docWiki;

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

      var fullName = Meteor.users.findOne({ _id : this.userId}).profile.fullName;

      //set defaults
      module.isTemplate = false;
      module.isArchived = false;
      module.inTrash = false;
      module.owner = {
        _id : this.userId,
        name : fullName,
        at : new Date()
      };

      //clean and validate date
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
copyHelpers.copyDocument = function(module) {

	//module = module.toObject();
	var sourceDocId = module._id;

	//update properties for a new module
	delete module['_id'];

	if (module.title.indexOf('Another copy of') === 0)  {
		//leave the title
	} else if (module.title.indexOf('Copy of') === 0) {
		module.title = module.title.replace('Copy of', 'Another copy of');
	} else {
		module.title = 'Copy of ' + module.title;
	}

	module.created.at = new Date();
	module.modified.at = new Date();

	Modules.insert( module, function(err, _id) {

		var targetDocId = _id;
		var newTitle = module.title;

		copyHelpers.copyPages(sourceDocId, targetDocId, newTitle);

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
copyHelpers.copyPages = function(sourceDocId, targetDocId, newTitle) {

	//loop through all pages found
	DocwikiPages.find( { documentId : sourceDocId} ).forEach( function(page) {

		var sourcePageId = page._id;

		//remove the id: we let the system create a new one
		delete page['_id'];
		page.created.at = new Date();
		page.modified.at = new Date();

		//set the parent (document) id to the newly created document
		page.documentId = targetDocId;
		page.pageId = targetDocId;

		//clear signatures
		page.signatures = [];

		DocwikiPages.insert( page, function(err, _id) {

		});

	});

};


