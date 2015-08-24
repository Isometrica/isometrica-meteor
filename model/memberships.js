
/**
 * Relation that joins users and organisations.
 *
 * @author Steve Fortune
 */
Memberships = MultiTenancy.memberships;

'use strict';
/**
 * Schema for memberships collection
 *
 * @host Client | Server
 * @var MultiTenancy.Schema
 */
Schemas.Membership = new MultiTenancy.Schema({
  userId: {
    type: String
  },
  isAccepted: {
    type: Boolean,
    defaultValue: false
  },
  canCreateUsers: {
    type: Boolean,
    defaultValue: false,
    label: 'Can create & delete users',
    isa: {
      fieldType: 'isaCheckbox'
    }
  },
  canCreateDocuments: {
    type: Boolean,
    defaultValue: true,
    label: 'Can create documents',
    isa: {
      fieldType: 'isaCheckbox'
    }
  },
  canEditOrgSettings: {
    type: Boolean,
    defaultValue: false,
    label: 'Can change organization settings',
    isa: {
      fieldType: 'isaCheckbox'
    }
  },
  canViewAllWorkInboxes: {
    type: Boolean,
    defaultValue: false,
    label: 'Can view all work inboxes',
    isa: {
      fieldType: 'isaCheckbox'
    }
  },
  canEditUserProfiles: {
    type: Boolean,
    label: 'Can edit user profiles',
    defaultValue: false,
    isa: {
      fieldType: 'isaCheckbox'
    }
  },
  canEditUserSuperpowers: {
    type: Boolean,
    defaultValue: false,
    label: 'Can edit user permissions',
    isa: {
      fieldType: 'isaCheckbox'
    }
  }
});

Memberships.attachSchema(Schemas.Membership);
Memberships.helpers({
  user: function() {
    return Meteor.users.findOne(this.userId);
  },
  org: function() {
    return Organisations.findOne(this._orgId);
  }
});

/**
 * @todo Secure
 */
Memberships.allow({
  update: function() {
    return true;
  }
});

/**
 * Does a membership already exist?
 *
 * @return Boolean
 */
var exists = function(userId) {
  return Memberships.find({
    userId: userId
  }).count() > 0;
};

Meteor.methods({

  /**
   * Accept a membership
   *
   * @param   userId  String
   */
  acceptMembership: function(userId) {
    if (!exists(userId)) {
      throw new Meteor.Error(404, 'Membership not found');
    }
    Memberships.update({
      userId: userId
    }, {
      $set: {
        isAccepted: true
      }
    });
  },

  /**
   * Declines an unaccepted membership.
   *
   * @param   userId  String
   */
  declineMembership: function(userId) {
    if (!Memberships.find({
      userId: userId,
      isAccepted: false
    }).count()) {
      throw new Meteor.Error(404, 'Pending membership not found');
    }
    Memberships.remove({
      userId: userId
    });
  },

  /**
   * Creates a !isActive membership
   *
   * @param   userId  String
   */
  inviteUser: function(userId) {
    if (exists(userId)) {
      throw new Meteor.Error(404, 'Membership already exists');
    }
    Memberships.insert({
      userId: userId
    });
  },

  /**
   * Does a membership exist for the given user id ?
   *
   * @param   userId  String
   * @return  Boolean
   */
  membershipExists: function(userId) {
    return exists(userId);
  },

  /**
   * @todo Implement. We need to migrate over to another
   * user.
   */
  removeMembership: function(compKey) {
    throw new Meteor.Error(405, 'Unimplemented');
  }

});
