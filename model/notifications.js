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

      //get hostname from system settings
      var settings = Settings.find({});

      contents = contents.replace("{{hostName}}", settings.hostName);

    	Notifications.insert( { ownerId : toId, subject : subject, contents: contents}, 
      function(err, notificationId) {

    		//forward notification by email (on the server only)
        if (Meteor.isServer) {

          Meteor.call('sendEmail', toId, subject, contents, function(err, res) {

      			//mark that the notification has been sent by email
      		  Notifications.update( { _id : notificationId }, 
              { $set : { sentAt : new Date(), hasBeenSent : true } } );

      		}); 
        }

    	});

    }),

   /*
   * Add an item to the work inbox of the specified user, forward the notification
   * by email. The item text is specified by the textId that is looked up in the
   * SystemTexts collection. In this text, any {{xx}} variables are substituted by their
   * values specified in the variables parameter. 
   * 
   * @author Mark Leusink
   * 
   * @param textId  id of the text to be used (found in the SystemTexts collection)
   * @parem toId    string or list of strings of the users to send the notification to
   *
   */
    "sendToInboxById" : MultiTenancy.method( function(textId, toId, variables) {

      if (toId == null || (typeof toId == 'string' && toId.length==0) || toId.length == 0) {
        console.error("cannot sent to inbox: invalid user");
        return;
      }

      if (typeof toId == 'string') { toId = [toId];}

      //get hostname from system settings
      var settings = Settings.findOne({});

      //get system text
      var text = SystemTexts.findOne( { textId : textId });

      var contents = text.contents;
      var subject = text.subject;

      //replace variables in system text
      for (key in variables) {
        subject = subject.replace('{{' + key + '}}', variables[key]);
        contents = contents.replace('{{' + key + '}}', variables[key]);
      }

      contents = contents.replace("{{hostName}}", settings.hostName);

      for (var i=0; i<toId.length; i++) {

        var sendTo = toId[i];
      
        Notifications.insert( { ownerId : sendTo, subject : subject, contents: contents}, 
        function(err, notificationId) {

          if (err) {
            console.error(err);
            return;
          }

          //forward notification by email (on the server only)
          if (Meteor.isServer) {

            Meteor.call('sendEmail', sendTo, subject, contents, function(err, res) {

              //mark that the notification has been sent by email
              Notifications.update( { _id : notificationId }, 
                { $set : { sentAt : new Date(), hasBeenSent : true } } );

            }); 
          }

        });

      }

    })

});
