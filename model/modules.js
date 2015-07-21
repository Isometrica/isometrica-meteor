/*
 * Modules in Isometrica
 *
 * @author Mark Leusink
 */

Modules = new Mongo.Collection("modules");
Partitioner.partitionCollection(Modules);

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

	console.log('copying', module);

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
	module.updatedAt = new Date();

	console.log('about to copy...');

	Modules.insert( module, function(err, _id) {

		var targetDocId = _id;
		var newTitle = module.title;

		copyHelpers.copyPages(sourceDocId, targetDocId, newTitle);

	} );

}

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
		page.updatedAt = new Date();

		//set the parent (document) id to the newly created document
		page.documentId = targetDocId;
		page.pageId = targetDocId;

		//clear comments & signatures
		page.comments = [];
		page.signatures = [];

		DocwikiPages.insert( page, function(err, _id) {

			copyHelpers.updateAttachedFiles(sourcePageId, _id );

		});

	});


}

/*
 * Search for attached files to a specific document,
 * for every file found, add the targetPageId to the list
 * of parent documents
 *
 * @author Mark Leusink
 */
copyHelpers.updateAttachedFiles = function(sourcePageId, targetPageId) {

	//TODO

/*
	gfs.files.find({ 'metadata.parentIds' : mongo.ObjectID(sourcePageId) }).toArray(function (err, files) {

	    if (err) {
	    	throw(err);
	    }

	    if (files.length > 0) {

	    	for (var i=0; i<files.length; i++) {

	    		//add a parent id to the files' metadata (as Mongo Object ID)
	    		gfs.files.update(
	    			{ _id : files[i]._id },
	    			{ $push : { 'metadata.parentIds' : targetPageId } }
	    		);
	    	}
	    }

	});*/

}
