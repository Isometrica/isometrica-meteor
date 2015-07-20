var Users = Meteor.users;

Schemas.UserProfile = new SimpleSchema({
  'firstName': {
    type: String
  },
  'lastName': {
    type: String
  },
  'phoneNumbers': {
    type: [PhoneNumberSchema],
    defaultValue: [],
    optional: true
  },
  'address': {
    type: String,
    optional: true
  }
});
Schemas.UserSchema = new SimpleSchema({
  group: {
    type: String,
    optional: true
  },
  profile: {
    type: Schemas.UserProfile,
    optional: true
  },
  emails: {
    type: [Object],
    optional: true
  },
  "emails.$.address": {
      type: String,
      regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
      type: Boolean
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  }
});

'use strict';

Base(Users, Schemas.UserSchema);
Users.attachSchema(Schemas.UserSchema);
Users.helpers({

  /**
   * @return String
   */
  fullName: function() {
    return this.profile.firstName + ' ' + this.profile.lastName;
  }

});

if (Meteor.isServer) {
  Meteor.methods({

    /**
     * Registers a new user as part of an organisation. Different from `registerUser`
     * in that this is _not_ for the generic sign up process. This is for when you
     * want to add a new user via the address book.
     *
     * @note Also unlike `registerUser`, you have to be logged in to call this
     * method.
     * @param user    Object
     */
    registerOrganisationUser: function(user) {
      console.log('Registering: ');
      console.log(user);
      var userId = Accounts.createUser(user);
      console.log('Registered user: ' + userId);
      console.log('Current group: ' + Partitioner.group());
      Partitioner.setUserGroup(userId, Partitioner.group());
      console.log('Inserting membership');
      Memberships.insert({
        userId: userId,
        isAccepted: true
      });
      console.log('Done!');
      return userId;
    },

    /**
     * Is a given email still vacant or has it already been used by another
     * user ?
     *
     * @param   email String
     * @return  Boolean
     */
    emailExists: function(email) {
      var exists;
      Partitioner.directOperation(function() {
        exists = !!Users.find({
          'emails.address': email
        }, {
          limit: 1
        }).count();
      });
      return exists;
    }

  });
}

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
   * Updates a user and their superpowers.
   *
   * @todo Update email address properly
   * @param id          String
   * @param profile     Object
   * @param superpowers Object
   */
  updateUser: function(id, profile, superpowers) {
    if (!Meteor.call('membershipExists', id)) {
      throw new Error('not-found');
    }
    if (!_.isEmpty(superpowers)) {
      Memberships.update({
        userId: id
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
  }

});
