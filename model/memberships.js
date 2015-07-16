
/**
 * Relation that joins users and organisations.
 *
 * @author Steve Fortune
 */
Memberships = new Mongo.Collection("memberships");

MembershipSchema = new SimpleSchema({
  userId: {
    type: String
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

Partitioner.partitionCollection(Memberships);
Partition(MembershipSchema);
Base(Memberships, MembershipSchema);

Memberships.attachSchema(MembershipSchema);
Memberships.helpers({
  user: function() {
    return Meteor.users.findOne(this.userId);
  },
  org: function() {
    return Organisations.findOne(this._groupId);
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

/**
 * @todo compKey will probably be replaced with just the userId when
 * we get the partitioner working
 */
Meteor.methods({

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
   * @todo Implement. We need to migrate over to another
   * user.
   */
  removeMembership: function(compKey) {
    throw new Meteor.Error(405, 'Unimplemented');
  }

});
