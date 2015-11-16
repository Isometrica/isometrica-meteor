
SyncedCron.add({
  name: 'Check DocWiki review lifecycle',

  schedule: function(parser) {
    //Note: parser is a later.parse object
    return parser.text('at 9:00 AM');
  }, 

  job: function(intendedAt) {

    var emailTextExpired = SystemTexts.findOne( { 'textId' : 'docwiki/email/expired' } );
    var emailTextAboutToExpire = SystemTexts.findOne( { 'textId' : 'docwiki/email/about-to-expire' } );

    var settings = Settings.findOne({} );

    var sendEmail = function(docWiki, subject, contents, hostName, expirationDate, appovalDate) {

      //send notification to the owner + all approvers
      var to = [docWiki.owner._id];
      _.each( docWiki.approvers, function(a) {
        to.push( a._id );
      });

      var variables = {
        title : docWiki.title,
        expirationDate : DateUtils.getFormattedDate(expirationDate),
        approvalDate: DateUtils.getFormattedDate(approvalDate),
        expirationDays : DateUtils.getDaysUntil(expirationDate),
        pageLink : getApprovePageLink(settings.hostName, docWiki)
      };

      //replace variables in system text
      for (key in variables) {
        subject = subject.replace('{{' + key + '}}', variables[key]);
        contents = contents.replace('{{' + key + '}}', variables[key]);
      }

      Meteor.call('sendEmail', to, subject, contents);

    };

    var getApprovePageLink = function(hostName, docWiki) {

      //return the full url to the current wiki module in approval mode
      return hostName + '/organisation/' + docWiki._orgId + 
        '/module/' + docWiki._id + '/approve//list/sections';

    };

    //find all approved and 'expired' docwikis
    Modules.direct.find( { 'status' : 'approved' }).forEach( function(docWiki) {
      //check expiration date

      var approvalDate = docWiki.lastApprovedAt;
      var today = new Date();

      //strip the time
      approvalDate.setHours(0);
      approvalDate.setMinutes(0);
      approvalDate.setSeconds(0);

      //get the expiration date (approved at + review freq)
      var expirationDate = new Date( approvalDate.getTime() );
      expirationDate.setMonth( expirationDate.getMonth() + docWiki.reviewFreqMonths);

      var reminderDays = docWiki.reviewExpiryRemindersDays;

      //if expires with the next X days (where x = reviewExpiryRemindersDays setting: send a notification)
      var sendNotificationOn = new Date( expirationDate.getTime() );
      sendNotificationOn.setDate( sendNotificationOn.getDate() - reminderDays);

      /*DEBUG INFO
      console.log('--- ---');
      console.log('found a docwiki: ' + docWiki.title + ' months valid: ' +  docWiki.reviewFreqMonths);
      console.log('approved at: ' + approvalDate);
      console.log('valid until: ' + expirationDate);
      console.log('send not at ' + sendNotificationOn);
      */

      var sendExpiresNotification = ( today.getTime() >= sendNotificationOn.getTime() ) && !docWiki.expiresNotificationSentOn;
      var sendExpiredNotification = ( today.getTime() >= expirationDate ) && !docWiki.expiredNotificationSentOn;

      if ( sendExpiredNotification ) {

        console.log('- document \'' + docWiki.title + '\' has expired: send notification');

        sendEmail( docWiki, 
          emailTextExpired.subject,
          emailTextExpired.contents, 
          settings.hostName, approvalDate, expirationDate);

        MultiTenancy.masqOp(docWiki._orgId, function() {

          //update status to not-approved + mark that the 'expired' notification has been sent
          Modules.update( { _id : docWiki._id}, { 
            $set : { 
              'status' : 'not-approved',
              'expiredNotificationSentOn' : new Date()
            }
          });

        });
       
      } else if (sendExpiresNotification ) {

        //the document is about to expire: create a new issue to record the new approvals and send a notification

        console.log('- document \'' + docWiki.title + '\' is about to expire: create issue and send notification');

        MultiTenancy.masqOp(docWiki._orgId, function() {

          DocwikiIssues.insert( {
            documentId : docWiki._id,
            _orgId : docWiki._orgId,
            contents : '-',
            issueDate : new Date(),
            authorisedBy : docWiki.owner,
            approvedBy : [],
            signedBy : []
          },{
            validate: false
          }, function(err, id) {

            if (err) {
              console.error("Error while creating issue:");
              console.error(err);
            }

            console.log(' - issue created, send email for ', id, DateUtils.getFormattedDate(expirationDate));

            sendEmail( docWiki,
              emailTextAboutToExpire.subject,
              emailTextAboutToExpire.contents, 
              settings.hostName, approvalDate, expirationDate);

            //mark that notification has been sent (so it's not send every day)
            Modules.update( { _id : docWiki._id}, { 
              $set : { 
                'expiresNotificationSentOn' : new Date()
              }
            });

          });

        }); //end masqOp

      }

    });

  }
});

Meteor.startup(function () {

  // code to run on server at startup
  SyncedCron.start();
  
});