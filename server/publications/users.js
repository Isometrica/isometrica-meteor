Meteor.publish('users', function() {

	//publish all users to users having the sysAdmin role only
	
	var isSysAdmin = Roles.userIsInRole(this.userId, ['sysAdmin'], '');

	if (!isSysAdmin) {

		return null;
	
	} else {

	  	return Meteor.users.find({}, { 
	  		sort : {
	  			'profile.lastName' : 1
	  		}
	  	});

	}

});