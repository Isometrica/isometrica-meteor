'use strict';

var _isIdInList = function(userId, list) {
    var found = false;
    for (var i=0; i<list.length && !found; i++) {
        found = (list[i]._id === userId);
    }
    return found;
};


Meteor.publish("docwikiPages", function(documentId) {

	check(documentId, String);

	var module = Modules.findOne( { _id: documentId });

  if (module != null && typeof module != 'undefined') {
  	
  	//check if the current user is authorized to retrieve this data
  	if (
  		module.allowEditByAll ||
  		module.allowReadByAll ||
  		module.owner._id == this.userId ||
  		_isIdInList( this.userId, module.readers) || 
  		_isIdInList( this.userId, module.editors) || 
  		_isIdInList( this.userId, module.approvers) || 
  		_isIdInList( this.userId, module.signers)
  	) {

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


