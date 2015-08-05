
var formatMailMessage = function(text) {

  var html = [];

  html.push("<style>a { color: #eee; text-decoration:none; } </style>");

  html.push("<div style='background: #eee; padding:25px;'>");
  html.push("<center><table cellpadding='10' style='background: #fff; border-collapse:collapse; border:1px solid #DDD; width:500px;'><tbody><tr><td>");
  
  html.push("<div style='font-weight:bold; text-align:center; color: #eee; margin-bottom:10px;'><a href='http://demo.isometrica.io'>Isometrica</a><hr /></div>");

  html.push(text);

  html.push("</td></tr><tbody></table></center></div>");

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
      console.log('send to ' + to);
    }

    var from = "Isometrica <no-reply@isometrica.io>";

    // Let other method calls from the same client start running, without waiting for the email sending to complete.
    this.unblock();

    Email.send({
      to: to,
      from: from,
      subject: subject,
      html: formatMailMessage(text)
    });
  }

});