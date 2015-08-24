

var formatMailMessage = function(text, hostName) {

  var html = [];

  html.push("<style>a { color: #eee; text-decoration:none; } </style>");

  html.push("<div style='background: #eee; padding:25px;'>");
  html.push("<center><table cellpadding='10' style='background: #fff; border-collapse:collapse; border:1px solid #DDD; width:500px;'><tbody>");

  html.push("<tr><td style=\"background: #444; text-align:center\"><a href=\"\">");
  html.push("<img style=\"width:200px\" src=\"" + hostName + "/img/logo-white-lowercase.png\">");
  html.push("</a></td></tr>");

  html.push("<tr><td style=\"background: #006E9E; line-height:10px; height:10px\">&nbsp;</td></tr>");

  html.push("<tr><td>");
  html.push(text); 
  html.push("</td></tr>");

  html.push("<tbody></table></center></div>");

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