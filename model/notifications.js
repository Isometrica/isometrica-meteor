/*
 * Work Inbox notifications
 *
 * @author Mark Leusink
 */

Notifications = new MultiTenancy.Collection("notifications");

Schemas.Notifications = new MultiTenancy.Schema([Schemas.IsaBase, {
  ownerId : {
  	type: String
  },
  subject : {
    type: String
  },
  contents : {
  	type: String
  },
  isNew : {
    type: Boolean,
    autoValue: function() {
        if (this.isInsert) {
            return true;
        }
    }
  },
  hasBeenSent : {
    type: Boolean,
    autoValue: function() {
        if (this.isInsert) {
            return false;
        }
    }
  },
  sentAt : {
    type : Date,
    optional : true
  }
}]);

Notifications.attachSchema(Schemas.Notifications);

/*
 * TODO for now we allow all actions for all authenticated users
 */

Notifications.allow({
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

Meteor.methods({

	/*
	 * Add an item to the work inbox of the specified user, forward the notification
	 * by email
	 * 
	 * @author Mark Leusink
	 *
	 */
    "sendToInbox" : MultiTenancy.method( function(toId, subject, contents) { 

    	Notifications.insert( { ownerId : toId, subject : subject, contents: contents}, 
      function(err, notificationId) {

    		//forward notification by email
    		Meteor.call('sendEmail', toId, subject, contents, function(err, res) {

    			//mark that notification has been sent
    		  Notifications.update( { _id : notificationId }, 
            { $set : { sentAt : new Date(), hasBeenSent : true } } );


    		}); 

    	});

    })

});
