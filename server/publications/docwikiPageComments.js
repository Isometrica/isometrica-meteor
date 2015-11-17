'use strict';

var _isIdInList = function(userId, list) {
    var found = false;
    for (var i=0; i<list.length && !found; i++) {
        found = (list[i]._id === userId);
    }
    return found;
};


Meteor.publish("docwikiPageComments", function(moduleId, parentId) {

	check(moduleId, String);
    check(parentId, String);

    var module = Modules.findOne( { _id: moduleId });

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

		    return DocwikiPageComments.find(
		        { moduleId : moduleId, parentId : parentId },
		        { sort : { 'created.at' : -1 } }
		    );

		}

	}

});
