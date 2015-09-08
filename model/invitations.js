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
 * Uses mark's `sendEmail` method to send out an invitation notification
 * with an 'accept' link in it.
 *
 * @param email String
 * @param memId String
 */
var sendInvitationEmail = function(email, memId, welcome) {
  var acceptUrl = Meteor.absoluteUrl('accept/' + memId);
  var msg = "You have been invited: " + acceptUrl + ".\n\n" + welcome;
  Meteor.call('sendEmail', email, 'Invitation', msg, function() {});
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
            sendInvitationEmail(email, memId);
          }
        } else {
          var userId = Accounts.createUser({
            email: email,
            profile: {
              fullName: 'Invited User'
            }
          });
          createMembership(userId);
          Accounts.sendEnrollmentEmail(userId);
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

      if (!id) {
        var mem = Memberships.direct.findOne({
          userId: this.userId,
          isAccepted: false
        });
        if (!mem) {
          throw new Meteor.Error(404, "Could not find any inactive memberships to accept.");
        }
        id = mem._id;
      }

      Memberships.direct.update({
        _id: id,
        userId: this.userId,
        isAccepted: false
      }, {
        $set: {
          isAccepted: true
        }
      });

    }

  });
}
