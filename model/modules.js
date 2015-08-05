/*
 * Modules in Isometrica
 *
 * @author Mark Leusink
 */

Modules = new MultiTenancy.Collection("modules");
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
  editors : {
    type : [Object],
    optional : true
  },
  'editors.$._id' : {
    type: String
  },
  'editors.$.name' : {
    type: String
  },
  owner : {
    type: Object
  },
  'owner._id' : {
    type: String
  },
  'owner.name' : {
    type: String
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
    label : 'Approval mode',
    type : String,
    optional: true,
    isa: {
        fieldType: 'isaToggle',
        fieldChoices : [{'label': 'Automatic', 'value' : 'automatic'}, {'label' : 'Manual', 'value' : 'manual'}]
    }
  }
}]);
Modules.attachSchema(Schemas.Module);

/*
 * TODO for now we allow all actions for authenticated users only
 */

Modules.allow({
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
        name : fullName
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

