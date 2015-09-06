
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
