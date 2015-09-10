_helpers = {

	isDeleteUpdate : function(fields, modifier) {
		
		/*
		 * Checks if a user tries to 'delete' a document (move it to the trash)
		 * Function is used in the 'allow' section of a collection
		 */

		for (var i=0; i<fields.length; i++) {
			if (fields[i] == 'inTrash') {
				return (modifier.$set && modifier.$set.inTrash === true);
			}
		}

		return false;
	},

	isUserMemberOf : function(list, userId) {

		/* Checks if the specified userId is in the (user doc) list */

		if (!list || list.length == 0) {
			return false;
		}

		var inList = false;
	    for (var i=0; i<list.length && !inList; i++) {
	      inList = list[i]._id == userId;
	    }

	    return inList;

	}

};