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
	}

};