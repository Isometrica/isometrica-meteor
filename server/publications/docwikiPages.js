'use strict';

var _isIdInList = function(userId, list) {
    var found = false;
    for (var i=0; i<list.length && !found; i++) {
        found = (list[i]._id === userId);
    }
    return found;
};

var _isReadAllowed = function(userId, module) {

  return module.allowEditByAll ||
      module.allowReadByAll ||
      module.owner._id == userId ||
      _isIdInList( userId, module.readers) || 
      _isIdInList( userId, module.editors) || 
      _isIdInList( userId, module.approvers) || 
      _isIdInList( userId, module.signers);

};

Meteor.publish("docwikiPages", function(documentId) {

	check(documentId, String);
  
	var module = Modules.findOne( { _id: documentId });

  if (module != null && typeof module != 'undefined') {
  	
  	//check if the current user is authorized to retrieve this data
  	if ( _isReadAllowed(this.userId, module) ) {

  		return DocwikiPages.find(
  	        { 
  	        	documentId : documentId, 
  	        	currentVersion : true
  	        },
  	        	{ 
  	        		sort : {
  	        			section : 1
  	        		} 
  	   		}
  	    );

  	}

  }

});

Meteor.publish("docwikiPageVersions", function(documentId, pageId) {

	  check(documentId, String);
    check(pageId, String);

    return DocwikiPages.find(
        { documentId : documentId, pageId : pageId },
        { sort : { 'version' : -1 } }
    );

});

/* Search for a text in all pages in all docwiki for the current organisation
 *
 * Uses Mongo Text Indexes: see https://docs.mongodb.org/manual/core/index-text/
 *
 * The index is created in server/boot/indexes.js
 */
Meteor.publish("docwikiPagesSearch", function(searchText, documentId, localOnly) {

  check(searchText, String);
  check(documentId, String);
  check(localOnly, Boolean);

  var doc = {};

  //console.log('search for ' , searchText, 'local? ', localOnly, documentId);

  //escape the search text here to do an exact match
  var query = { $text : { $search : '\"' + searchText + '\"'}, currentVersion:true, inTrash:false};

  //for a local search we only search in the current document
  if (localOnly) {
    query.documentId = documentId;
  }

  var searchResults = DocwikiPages.find( query ).fetch();
  var pageIds = [];
         
  for (var i = 0; i < searchResults.length; i++) {

    //get the parent module to check if the user is allowed to access it
    var module = Modules.findOne( { _id : searchResults[i].documentId });

    if ( _isReadAllowed(this.userId, module) ) {
      pageIds.push(searchResults[i]._id);
    }
  }

  if (pageIds) {
      doc._id = {
          $in: pageIds
      };
  }

  return DocwikiPages.find(doc);

});

