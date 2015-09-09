
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

var buildOwnerPred = function(trans, userId) {
  var predicate = {};
  var kp = trans.ownerDocPath || 'owner';
  predicate[kp + '._id'] = userId;
  return predicate;
};

Meteor.mtMethods({

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
  deleteMembership: function(trgId, dstId) {

    /**
     * An array of config objects that describe which collections need to be
     * checked for transferable documents and how to transfer them, before
     * a membership is deleted.
     *
     * - `collection`: the `MultiTenancy.Collection` to query
     * - `ownerDocPath`: the key path of the 'owner' subdoc within documents
     *   of thet `collection`. Defaults to `owner`.
     *
     * The value paired with the `ownerDocPath` key should be an object
     * which confroms to `Schema.IsaUserDoc`.
     *
     * @note We don't define this at the top level because of Meteor's annoying
     * load order. Any of the collections referenced herein that fall after
     * 'memberships' in the alphabet won't exist yet.
     * @const Array
     */
    var transferables = [
      {
        collection: Modules
      }
    ];

    var targetMem = Memberships.findOne(trgId);
    var destMem = Memberships.findOne(dstId);

    if (!targetMem || !destMem) {
      throw new Meteor.Error(400, "Users must both exist in the same org.");
    }
    if (targetMem._id === destMem._id) {
      throw new Meteor.Error(400, "Can't be the same user");
    }

    _.each(transferables, function(trans) {
      trans.collection.update(buildOwnerPred(trans, targetMem.userId), {
        $set: _.extend(buildOwnerPred(trans, destMem.userId), {
          fullName: destMem.user().fullName
        })
      });
    });

    Memberships.remove(targetMem._id);

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
