var Users = Meteor.users;

UserProfileSchema = new SimpleSchema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  phoneNumbers: {
    type: PhoneNumberSchema
  },
  address: {
    type: String
  }
});

UserSchema = new SimpleSchema({
  /// @todo Email exists validation, validate against object defined
  /// here: http://docs.meteor.com/#/full/meteor_users
  // emails: [String],
  profile: {
    type: UserProfileSchema,
    optional: false
  }
});

'use strict';

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
   * @param id          String
   * @param profile     Object
   * @param superpowers Object
   * @param orgId       String
   */
  updateUser: function(id, profile, superpowers, orgId) {
    Memberships.update({
      userId: id,
      organisationId: orgId
    }, {
      $set: superpowers
    });
    Users.update(id, {
      $set: {
        email: profile.email,
        profile: profile
      }
    });
  }

});
