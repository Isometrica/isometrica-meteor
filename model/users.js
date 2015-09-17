'use strict';

var Users = Meteor.users;

Schemas.UserProfile = new SimpleSchema([
  Schemas.IsaContactable,
  Schemas.IsaProfilePhoto,
  {
    timezone: {
      type: String,
      label: "Timezone",
      optional: true,
      isa: {
        placeholder: 'Select a timezone.'
      },
      allowedValues: [
        'London (GMT)',
        'New York (ET)',
        'San Francisco (PDT)',
        'Chicago (CST)'
      ]
    },
    firstName: {
      type: String,
      label: "First Name",
      isa: {
        placeholder: 'Enter your first name.'
      },
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
      isa: {
        placeholder: 'Enter your last name.'
      },
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
      max : 4,
      label: "Initials",
      optional: true,
      isa: {
        placeholder: 'Enter your initials.'
      }
    },
    address: {
      type: String,
      max : 500,
      label: "Postal Address",
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
        fieldType: 'isaOrgAttribute',
        placeholder: 'Enter your role.',
        orgOptionKey: 'roles'
      }
    }
  }
]);
Schemas.User = new SimpleSchema({
  createdAt: {
    type: Date,
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
Schemas.UserSignup = new SimpleSchema([Schemas.Credentials, Schemas.UserProfile.pick('fullName'), {
  orgName: {
    type: String,
    max : 500,
    label: "Company or Organisation",
    isa: {
      placeholder: 'Enter the name of your company / organisation.'
    }
  }
}]);
Schemas.UserEdit = new SimpleSchema([Schemas.UserProfile, Schemas.Credentials]);

Users.attachSchema(Schemas.User);

/**
 * @todo Secure
 */
Users.allow({
  update: function() {
    return true;
  }
});

/**
 * Helper function - maps an object that conforms to the UserSignup schema to
 * an object that conforms to the User.
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
          fullName: user.fullName,
          _id: userId
        }
      });
      MultiTenancy.masqOp(orgId, function() {
        Memberships.insert({
          userId: userId,
          isAccepted: true,
          canCreateUsers: true,
          canCreateDocuments: true,
          canEditOrgSettings: true,
          canViewAllWorkInboxes: true,
          canEditUserProfiles: true,
          canEditUserSuperpowers: true,
          canEditManagementSetup: true,
          canCreateEditDashboard: true
        });
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
    registerOrganisationUser: MultiTenancy.method(function(user, membership) {
      var userId = Accounts.createUser(user);
      if(userId) {
        Memberships.insert(_.extend(membership, {
          userId: userId,
          isAccepted: true
        }));
      }
      return userId;
    }),

    /**
     * Sends a reset password to the give user.
     *
     * @todo Throttle
     * @param userId  String
     */
    resetUserPassword: function(userId) {
      Accounts.sendResetPasswordEmail(userId);
    }

  });

}
