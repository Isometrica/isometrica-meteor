

var formatMailMessage = function(text, hostName) {

  var html = [];

  html.push('<style type="text/css">a { color: #00b2e2;}</style>');

    html.push('<table cellspacing="0" border="0" style="background-color: white;" cellpadding="0" width="100%">');
      html.push('<tr>');
        html.push('<td valign="top" style="padding: 20px;">');
          html.push('<img src="' + hostName + '/img/logo-dark-lowercase.png" style="width: 200px; margin: 10px 0;" />');

          html.push('<div class="divider" style="background: #ddd; height: 2px; margin: 20px 0;"></div>');

          html.push('<p style="margin: 10px 0; color: #444; font-size: 15px; font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif; line-height: 22px; font-weight: bold">');
          html.push(text);
          html.push('</p>');

          html.push('<div class="divider" style="background: #ddd; height: 2px; margin: 20px 0;"></div>');

          html.push('<p style="margin: 10px 0; color: #777; font-size: 12px; font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif; line-height: 20px;">');
          html.push('If you\'ve received this in error, or you don\'t want to receive any more email from us, ');
          html.push('please <a href="' + hostName + '" style="color: #00b2e2;">click here to unsubscribe</a>.');
          html.push('</p>');

        html.push('</td>');
      html.push('</tr>');
    html.push('</table>');


  return html.join("");

};

/*
 * Method to send an email to a user. User ('to') can be specified as an email address or user _id
 *
 * @author Mark Leusink
 */

Meteor.methods({

  sendEmail: function (to, subject, text) {

    check([to, subject, text], [String]);

    if (to.indexOf('@') == -1) {

      //assume it's a user id: get the email address from the user's profile
      var user = Meteor.users.findOne( { _id : to});
      to = user.emails[0].address;
      console.log('sending email to: ' + to);

    }

    //get system settings
    var settings = Settings.findOne({});

    // Let other method calls from the same client start running, without waiting for the email sending to complete.
    this.unblock();

    Email.send({
      to: to,
      from: settings.emailFromAddress,
      subject: subject,
      html: formatMailMessage(text, settings.hostName)
    });
  }

});