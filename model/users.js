'use strict';

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
  emails: [String],
  profile: {
    type: UserProfileSchema,
    optional: false
  }
});

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
      orgId: orgId
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
