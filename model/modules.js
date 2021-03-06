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
    type: String
  },
  type: {
    type: String
  },
  description: {
    type: String,
    optional: true
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


    }

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

	module.createdAt = new Date();
	module.modifiedAt = new Date();

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
		page.createdAt = new Date();
		page.modifiedAt = new Date();

		//set the parent (document) id to the newly created document
		page.documentId = targetDocId;
		page.pageId = targetDocId;

		//clear signatures
		page.signatures = [];

		DocwikiPages.insert( page, function(err, _id) {

		});

	});

};

