'use strict';

var Users = Meteor.users;

Schemas.UserProfile = new SimpleSchema({
  'firstName': {
    type: String,
    autoValue: function() {
      var fullName = this.siblingField('fullName');
      if (this.isInsert && !this.isSet && fullName.isSet) {
        return fullName.value.substring(0, fullName.value.indexOf(' '));
      }
    }
  },
  'lastName': {
    type: String,
    autoValue: function() {
      var fullName = this.siblingField('fullName');
      if (this.isInsert && !this.isSet && fullName.isSet) {
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

        //get the current user's profile so we can re-calculate the fullname
        var user = Meteor.users.findOne( { _id : this.docId }, { fields : {profile: 1 }});

        firstName = (firstName.isSet ? firstName.value : user.profile.firstName);
        lastName = (lastName.isSet ? lastName.value : user.profile.lastName);

        //can only set full name when doing an insert
        this.unset();

        return firstName + ' ' + lastName;
      }
      else {

        //can only set full name when doing an insert
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
Schemas.Credentials = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: "Email",
    max: 500,
    isa: {
      inputType: 'email',
      placeholder: 'Enter your email.',
      focus: true
    }
  },
  password: {
    type: String,
    label: "Password",
    max: 500,
    min: 8,
    isa: {
      inputType: 'password',
      placeholder: 'Enter a password.'
    }
  }
});
Schemas.UserSignup = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: "Email",
    max: 500,
    isa: {
      inputType: 'email',
      placeholder: 'Enter an email.'
    }
  },
  password: {
    type: String,
    label: "Password",
    max: 500,
    min: 8,
    isa: {
      inputType: 'password',
      placeholder: 'Enter a password.'
    }
  },
  name: {
    type: String,
    max : 500,
    label: "Full Name",
    isa: {
      placeholder: 'Enter your full name.',
      focus: true
    }
  },
  orgName: {
    type: String,
    max : 500,
    label: "Company or Organisation",
    isa: {
      placeholder: 'Enter the name of your company / organisation.'
    }
  }
});

Users.attachSchema(Schemas.UserSchema);
Users.helpers({
  account: function() {
    return AccountSubscriptions.findOne({
      'owner._id': this._id
    });
  }
});

if (Meteor.isServer) {
  Meteor.methods({
    /**
     * Register user. In the future, this is the place where we'll be
     * setting up the account, etc.
     *
     * @todo What are the full requirements here?
     * @todo 2-phase commits; transaction-likeness
     * @param user  Object from Schema.UserSignup
     */
    registerUser: function(user) {
      var orgId = Organisations.insert({
        name: user.orgName
      });
      MultiTenancy.masqOp(orgId, function() {
        var userId = Accounts.createUser(_.extend({
          profile: {
            fullName: user.name
          }
        }, user));
        Memberships.insert({
          userId: userId,
          isAccepted: true
        });
        if (process.env.NODE_ENV !== "production" && !process.env.MAIL_URL) {
          console.log(
            "You need to set a MAIL_URL if you're running !prod. " +
            "See here: http://docs.meteor.com/#/full/email"
          );
        }
        Accounts.sendVerificationEmail(userId);
      });
      return orgId;
    }
  });
}

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
  registerOrganisationUser: MultiTenancy.method(function(user) {
    var userId = Accounts.createUser(user);
    if(userId) {
      Memberships.insert({
        userId: userId,
        isAccepted: true
      });
    }
    return userId;
  }),

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
