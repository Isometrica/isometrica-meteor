
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
  },
  canDeleteOrganisation: {
    type: Boolean,
    defaultValue: false,
    label: 'Can delete organisation',
    isa: {
      fieldType: 'isaCheckbox'
    }
  },
  canCreateEditDashboard: {
    type: Boolean,
    defaultValue: false,
    label: 'Can create & edit dashboard items',
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

if (Meteor.isServer) {

  /**
   * Migrates documents in the Modules collection from the user in the trgMem to
   * the user in the destMem.
   *
   * @note Not atomic, we use the `multi` attribute and perform to separate queries
   * to purge the modules.
   *
   * @param trgMem  Object
   * @param destMem Object
   */
  var migrateDocs = function(trgMem, destMem) {

    var opts = { multi: true };
    var pullCond = { _id: trgMem.userId };

    Modules.update({ 'owner._id': trgMem.userId }, {
      $set: {
        'owner._id': destMem.userId,
        'owner.fullName': destMem.user().profile.fullName
      },
    }, opts);
    Modules.update({
      $or: [
        { 'readers._id': trgMem.userId },
        { 'editors._id': trgMem.userId },
        { 'approvers._id': trgMem.userId },
        { 'signers._id': trgMem.userId }
      ]
    }, {
      $pull: {
        readers: pullCond,
        editors: pullCond,
        approvers: pullCond,
        signers: pullCond
      }
    }, opts);

  };

  Meteor.methods({

    /**
     * Deleting a membership is no trivial task. All 'ownable' documents that are
     * in the target user's name must be transfered to another user in the organisation.
     *
     * Procedure:
     *
     * - Assert both user ids point to valid users that are part of the same org
     * - Assert srcId and dstId are not the same
     * - @todo Access control (can the user delete other users?)
     * - Update all subdocuments in collections that are required to be transferred
     * - Delete the membership in question
     *
     * @todo Error handling..
     * @param trgId   String
     * @param dstId   String
     */
    deleteMembership: MultiTenancy.method(function(trgId, dstId) {

      var targetMem = Memberships.findOne(trgId);
      var destMem = Memberships.findOne(dstId);

      if (!targetMem || !destMem) {
        throw new Meteor.Error(400, "Users must both exist in the same org.");
      }
      if (targetMem._id === destMem._id) {
        throw new Meteor.Error(400, "Can't be the same user");
      }

      migrateDocs(targetMem, destMem);
      Memberships.remove(targetMem._id);

    })
  });
}

/**
 * @todo Secure
 */
Memberships.allow({
  update: function() {
    return true;
  }
});
