Memberships = new Mongo.Collection("memberships");

MembershipSuperpowers = new SimpleSchema({
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
