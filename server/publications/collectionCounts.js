
//total number of registered users
Meteor.publish('PubUserCounter', function() {
	if ( Roles.userIsInRole(this.userId, ['sysAdmin'], '') ) {
  		Counts.publish(this, 'userCounter', Meteor.users.find());
  	}
});

//total number of docwiki's
Meteor.publish('PubDocCounter', function() {
	if ( Roles.userIsInRole(this.userId, ['sysAdmin'], '') ) {
  		Counts.publish(this, 'docCounter', Modules.find( { type : 'docwiki' } ));
  	}
});