var Users = Meteor.users;

Schemas.UserProfile = new SimpleSchema({
  'firstName': {
    type: String,
    autoValue: function() {
      var fullName = this.siblingField('fullName');
      if (this.isInsert && !this.isSet) {
        return fullName.value.substring(0, fullName.value.indexOf(' '));
      }
    }
  },
  'lastName': {
    type: String,
    autoValue: function() {
      var fullName = this.siblingField('fullName');
      if (this.isInsert && !this.isSet) {
        return fullName.value.substring(fullName.value.indexOf(' ')+1);
      }
    }
  },
  'fullName': {
    type: String,
    autoValue: function() {

      var firstName = this.siblingField('firstName');
      var lastName = this.siblingField('lastName');


      if (this.isInsert) {

        if (!this.isSet || ( firstName.isSet && lastName.isSet ) ) {
          //fullname not set, or firstName/ lastName name set: update full name
          return firstName.value + ' ' + lastName.value;
        }

      }
      else if (firstName.isSet || lastName.isSet) {
        var user = Meteor.users.find( { _id : this.docId }, { fields : {profile: 1 }}).fetch()[0];

        firstName = (firstName.isSet ? firstName.value : user.profile.firstName);
        lastName = (lastName.isSet ? lastName.value : user.profile.lastName);

        //can only set full name when doing an insert
        this.unset();

        return firstName + ' ' + lastName;
      }
      else {
        this.unset();
      }
    }
  },
  'phoneNumbers': {
    type: [Schemas.PhoneNumberSchema],
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
  createdAt: {
    type: Date,
    optional:true
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

Users.attachSchema(Schemas.UserSchema);
Users.helpers({

  /**
   * @return String
   */
  fullName: function() {
    return this.profile.firstName + ' ' + this.profile.lastName;
  }

});

registerOrganisationUser = function(user) {
  var userId = Accounts.createUser(user);
  if(userId) {
    Memberships.insert({
      userId: userId,
      isAccepted: true
    });
  }
  return userId;
};

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
  registerOrganisationUser: MultiTenancy.method(registerOrganisationUser),

  /**
   * Is a given email still vacant or has it already been used by another
   * user ?
   *
   * @param   email String
   * @return  Boolean
   */
  emailExists: function(email) {
    return !!Users.find({
      'emails.address': email
    }, {
      limit: 1
    }).count();
  },

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
  updateUser: MultiTenancy.method(function(id, profile, superpowers) {
    if (!_.isEmpty(superpowers)) {
      Memberships.update({
        userId: id
      }, {
        $set: superpowers
      });
    }
    if (!_.isEmpty(profile)) {
      Users.update(id, {
        $set: {
          'emails.0.address': profile.email,
          profile: profile
        }
      });
    }
  })

});
