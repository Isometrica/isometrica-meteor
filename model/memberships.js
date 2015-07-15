
/**
 * Relation that joins users and organisations.
 *
 * @author Steve Fortune
 */
Memberships = new Mongo.Collection("memberships");

MembershipSchema = new SimpleSchema({
  userId: {
    type: String,
  },
  isAccepted: {
    type: Boolean,
    defaultValue: false
  },
  canCreateUsers: {
    type: Boolean,
    defaultValue: false
  },
  canCreateDocuments: {
    type: Boolean,
    defaultValue: true
  },
  canEditOrgSettings: {
    type: Boolean,
    defaultValue: false
  },
  canViewAllWorkInboxes: {
    type: Boolean,
    defaultValue: false
  },
  canEditUserProfiles: {
    type: Boolean,
    defaultValue: false
  },
  canEditUserSuperpowers: {
    type: Boolean,
    defaultValue: false
  }
});

'use strict';

Timestamp(Memberships);
Partitioner.partitionCollection(Contacts);

Memberships.attachSchema(MembershipSchema);
Memberships.helpers({
  user: function() {
    return Meteor.users.findOne(this.userId);
  },
  org: function() {
    return Organisations.findOne(this.organistationId);
  }
});

/**
 * Does a membership already exist?
 *
 * @param compKey Object
 * @return Boolean
 */
var exists = function(compKey) {
  return compKey ? Memberships.find({
    userId: compKey.userId,
    organisationId: compKey.organisationId
  }).count() > 0 : false;
};

/**
 * @todo compKey will probably be replaced with just the userId when
 * we get the partitioner working
 */
Meteor.methods({

  /**
   * Does a membership exist for the given comp key
   *
   * @param compKey Object
   * @return Boolean
   */
  membershipExists: function(compKey) {
    return exists(compKey);
  },

  /**
   * Creates a !isAction membership
   *
   * @param compKey Object
   */
  inviteUser: function(compKey) {
    if (exists(compKey)) {
      throw new Meteor.Error('not-found', 'Membership already exists');
    }
    Memberships.insert(compKey);
  },

  /**
   * Accept a membership
   *
   * @param compKey Object
   */
  acceptMembership: function(compKey) {
    if (!exists(compKey)) {
      throw new Meteor.Error('not-found', 'Membership not found');
    }
    Memberships.update(compKey, {
      $set: {
        isAccepted: true
      }
    });
  },

  /**
   * Declines an unaccepted membership.
   *
   * @param compKey Object
   */
  declineMembership: function(compKey) {
    if (!Memberships.find({
      userId: compKey.userId,
      organisationId: compKey.organisationId,
      isAccepted: false
    }).count()) {
      throw new Meteor.Error('not-found', 'Pending membership not found');
    }
    Memberships.remove(compKey);
  },

  /**
   * @todo Implement. We need to migrate over to another
   * user.
   */
  removeMembership: function(compKey) {
    throw new Meteor.Error('unimplemented');
  }

});
