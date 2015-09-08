'use strict';

/**
 * Schemas used to model the 'invite user' form.
 *
 * @author Steve Fortune
 */
Schemas.Email = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    max: 500,
    optional: true,
    isa: {
      fieldType: 'isaInvitation',
      placeholder: 'Invite a user.'
    }
  }
});
Schemas.Invitations = new SimpleSchema({
  welcomeMessage: {
    type: String,
    max : 1000,
    label: "Welcome Message",
    optional: true,
    isa: {
      fieldType: 'isaTextarea',
      placeholder: 'Enter a welcome message.'
    }
  },
  emails: {
    type: [Schemas.Email],
    defaultValue: []
  }
});

/**
 * Functions that ping out various notification emails.
 *
 * These user mark's `sendEmail` method to send out an invitation notification
 * with an 'accept' link in it.
 *
 * @todo The security of this relies of `sendMail`.
 */

var sendFormatted = function(email, msg) {
  Meteor.call('sendEmail', email, 'Invitation', msg, function() {});
};
var sendInvitationEmail = function(email, welcome, memId) {
  var acceptUrl = Meteor.absoluteUrl('accept/' + memId);
  var msg = "You have been invited: " + acceptUrl + ".\n\n" + welcome;
  sendFormatted(email, msg);
};
var sendLinkConfirmationEmail = function(email) {
  sendFormatted(email, "Your Isometrica account was successfully linked to a new organisation!");
};
var sendEnrollEmail = function(email, userId, welcome, memId) {
  var token = generateResetToken(email, userId);
  var enrollUrl = Meteor.absoluteUrl('enroll/' + token + '/' + memId);
  var msg = "You have been invited: " + enrollUrl + ".\n\n" + (welcome || '');
  sendFormatted(email, msg);
};

/**
 * Creates a new, inactive membership.
 *
 * @param id    String
 */
var createMembership = function(id) {
  return Memberships.insert({
    userId: id
  });
};

/**
 * Generates a 'reset token', compatible with the token that Meteor.Accounts
 * generates on `sendResetPasswordEmail`.
 *
 * @param email   String The email to associate with the record.
 * @param userId  String The user to update with the token record.
 * @return String The token object generated.
 * @see https://github.com/meteor/meteor/blob/devel/packages/accounts-password/password_server.js#L456-L465
 */
var generateResetToken = function(email, userId) {
  var token = {
    token: Random.secret(),
    email: email,
    when: new Date()
  };
  Meteor.users.update(userId, {$set: {
    "services.password.reset": token
  }});
  return token.token;
};

/**
 * Predicates for transforming an invitation into an array of emails
 *
 * @var Fn
 */

var addrUnique = function(address) {
  return address.email;
};
var addrEmpty = function(address) {
  return address.email && address.email.trim() !== '';
}


if (Meteor.isServer) {
  Meteor.methods({

    /**
     * Sends out invitations to a set of email addresses notifying
     * of a new membership between the users and the given
     * organisation.
     *
     * @param invitations Object
     */
    inviteUsers: MultiTenancy.method(function(invitations) {

      this.unblock();

      Schemas.Invitations.clean(invitations);
      var emails = _.map(_.uniq(_.filter(invitations.emails, addrEmpty), addrUnique), addrUnique);

      if (!emails.length) {
        throw new Error(400, "> 0 emails must be provided");
      }

      _.each(emails, function(email) {
        var user = Meteor.users.findOne({ 'emails.address': email });
        if (user) {
          if (!Memberships.find({ userId: user._id }).count()) {
            var memId = createMembership(user._id);
            sendInvitationEmail(email, invitations.welcomeMessage, memId);
          }
        } else {
          var userId = Accounts.createUser({
            email: email,
            profile: {
              fullName: 'Invited User'
            }
          });
          var memId = createMembership(userId);
          sendEnrollEmail(email, userId, invitations.welcomeMessage, memId);
        }
      });
    }),

    /**
     * Accepts a pending membership between a user and an organisation.
     * Pings out a confirmation email to the user.
     *
     * @todo Access control
     * @param id  String
     */
    acceptMembership: function(id) {

      var pred = {
        userId: this.userId,
        isAccepted: false
      };
      if (id) {
        pred._id = id;
      }
      var mem = Memberships.direct.findOne(pred);
      if (!mem) {
        throw new Meteor.Error(404, "Could not find any inactive memberships for user.");
      }
      Memberships.direct.update(pred, {
        $set: {
          isAccepted: true
        }
      });
      var user = Meteor.users.findOne(mem.userId);
      sendLinkConfirmationEmail(user.emails[0].address);

    }

  });
}