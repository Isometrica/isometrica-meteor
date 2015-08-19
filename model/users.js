'use strict';

var Users = Meteor.users;

Schemas.UserProfile = new SimpleSchema([Schemas.IsaContactable, {
  firstName: {
    type: String,
    label: "First Name",
    autoValue: function() {
      var fullName = this.siblingField('fullName');
      if (this.isInsert && !this.isSet && fullName.isSet) {
        return fullName.value.substring(0, fullName.value.indexOf(' '));
      }
    }
  },
  lastName: {
    type: String,
    label: "Last Name",
    autoValue: function() {
      var fullName = this.siblingField('fullName');
      if (this.isInsert && !this.isSet && fullName.isSet) {
        return fullName.value.substring(fullName.value.indexOf(' ')+1);
      }
    }
  },
  fullName: {
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
    },
    label: "Name",
    isa: {
      placeholder: 'Enter your full name.'
    }
  },
  initials: {
    type: String,
    max : 500,
    label: "Initials",
    optional: true,
    isa: {
      placeholder: 'Enter your initials.'
    }
  },
  photo: {
    type: Schemas.IsaFileDescriptor,
    label: "Photo",
    isa: {
      fieldType: 'isaProfilePhoto'
    }
  },
  address: {
    type: String,
    max : 500,
    label: "Address",
    optional: true,
    isa: {
      fieldType: 'isaTextarea',
      placeholder: 'Enter your address.'
    }
  },
  title: {
    type: String,
    max : 500,
    label: "Job Title",
    optional: true,
    isa: {
      placeholder: 'Enter your job title.'
    }
  },
  role: {
    type: String,
    max : 500,
    label: "Role in organization",
    optional: true,
    isa: {
      placeholder: 'Enter your title.'
    }
  }
}]);
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
  fullName: {
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

/**
 * Helper function - maps an object that conforms to the UserSignup schema to
 * an object that conforms to the UserSchema.
 *
 * @var signupObj Object
 * @return Object
 */
var signupToProfile = function(signupObj) {
  return _.extend({
    profile: {
      fullName: signupObj.fullName
    }
  }, signupObj);
};

Users.helpers({
  /**
   * Returns object compliant with Schemas.IsaUserDoc.
   *
   * @return Object
   */
  embeddedDoc: function() {
    return {
      _id: this._id,
      name: this.firstName + ' ' + this.lastName
    };
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
      var userId = Accounts.createUser(signupToProfile(user));
      var orgId = Organisations.insert({
        name: user.orgName,
        owner: {
          name: user.name,
          _id: userId
        }
      });
      MultiTenancy.masqOp(orgId, function() {
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
    },
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
      var userId = Accounts.createUser(signupToProfile(user));
      if(userId) {
        Memberships.insert({
          userId: userId,
          isAccepted: true
        });
      }
      return userId;
    })
  });
}

Meteor.methods({

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
   * @todo I don't think this should be a method. We never do this in the
   *       backend.
   * @todo Update email address properly
   * @param id          String
   * @param profile     Object
   */
  updateUser: function(id, profile) {
    if (!_.isEmpty(profile)) {
      Users.update(id, {
        $set: {
          'emails.0.address': profile.email,
          profile: profile
        }
      });
    }
  }

});
