var Users = Meteor.users;

UserSchema = new SimpleSchema({
  'emails.$.address': {
    type: String
  },
  'profile.firstName': {
    type: String
  },
  'profile.lastName': {
    type: String
  },
  'profile.phoneNumbers': {
    type: [PhoneNumberSchema],
    defaultValue: []
  },
  'profile.address': {
    type: String
  }
});

'use strict';

// @todo Attach this at some point..
//Users.attachSchema(UserSchema);

Users.helpers({

  /**
   * @return String
   */
  fullName: function() {
    return this.profile.firstName + ' ' + this.profile.lastName;
  },

  /**
   * @return Cursor
   */
  memberships: function() {
    return Memberships.find({
      userId: this.userId
    });
  }

});

/**
 * @todo orgId will probably be scrapped when we start using the
 * partitioner.
 */
Meteor.methods({

  /**
   * Register user. In the future, this is the place where we'll be
   * setting up the account, etc.
   *
   * @param user  Object
   */
  registerUser: function(user) {
    console.log("Register user");
    return Accounts.createUser(user);
  },

  /**
   * Registers a new user as part of an organisation. Different from `registerUser`
   * in that this is _not_ for the generic sign up process. This is for when you
   * want to add a new user via the address book.
   *
   * @param user  Object
   * @param orgId String
   */
  registerOrganisationUser: function(user, orgId) {
    var userId = Accounts.createUser(user);
    Memberships.insert({
      userId: userId,
      organisationId: orgId,
      isAccepted: true
    });
    return userId;
  },

  /**
   * Updates a user and their superpowers.
   *
   * @todo Update email address properly
   * @param id          String
   * @param profile     Object
   * @param superpowers Object
   * @param orgId       String
   */
  updateUser: function(id, profile, superpowers, orgId) {
    var memKey = {
      userId: id,
      organisationId: orgId
    };
    if (!Meteor.call('membershipExists', memKey)) {
      throw new Error('not-found');
    }
    if (!_.isEmpty(superpowers)) {
      Memberships.update({
        userId: id,
        organisationId: orgId
      }, {
        $set: superpowers
      });
    }
    Users.update(id, {
      $set: {
        'emails.0.address': profile.email,
        profile: profile
      }
    });
  },

  /**
   * Is a given email still vacant or has it already been used by another
   * user.
   *
   * @note Why is this a method, not just a local query? Because in the near
   * future we will be partitioning the data and only publishing users that
   * exist within a client's organistaion. This query needs to be sys-wide
   *
   * @param   email String
   * @return  Boolean
   */
  emailExists: function(email) {
    console.log("Users:");
    console.log(Users.find({}).fetch());
    return !!Users.find({
      'emails.address': email
    }, {
      limit: 1
    }).count();
  }

});
