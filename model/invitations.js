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

if (Meteor.isServer) {
  Meteor.mtMethods({
    /**
     * Sends out invitations to a set of email addresses notifying
     * of a new membership between the users and the given
     * organisation.
     *
     * The procedure is as follows:
     *
     * - For all emails in the invitation
     *  - If some user exists in the system such that their email
     *    address is equal to the invitation email in question
     *    - If some membership exists between the user in question
     *      and the organisation in question
     *      - Ignore the invitation for that specific email
     *    - Else
     *      - Create a membership between them
     *      - Send out an email notification
     *  - Else
     *    - Register a new user as part of that organisation
     *    - Send out an email notification
     *    - The email notification should contain a link allowing
     *      the user to set their initial password.
     *
     * @param invitations Object
     */
    inviteUsers: function(invitations) {

      var unique = function(address) {
        return address.email;
      };
      var empty = function(address) {
        return address.email && address.email.trim() !== '';
      }
      var insertMembership = function(id) {
        Memberships.insert({
          userId: id
        });
      };

      Schemas.Invitations.clean(invitations);
      var emails = _.map(_.uniq(_.filter(invitations.emails, empty), unique), unique);

      if (!emails.length) {
        throw new Error(400, "> 0 emails must be provided");
      }

      _.each(emails, function(email) {
        var user = Meteor.users.findOne({ 'emails.address': email });
        if (user) {
          if (!Memberships.find({
            userId: user._id
          }).count()) {
            insertMembership(user._id);
            /// @TODO: Send out email
          }
        } else {
          var userId = Accounts.createUser({
            email: email,
            profile: {
              fullName: 'Invited User'
            }
          });
          insertMembership(userId);
          Accounts.sendEnrollmentEmail(userId);
        }
      });
      
    }
  });
}
