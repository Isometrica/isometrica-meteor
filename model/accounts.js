
BillingAccounts = new Mongo.Collection("accounts");

'use strict';

BillingAccounts.allow({
  update: function() {
    return true; // TODO: If logged in and they are part of this account and updating attributes that they have access to
  }
});

Schemas.BillingDetails = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  zip: {
    type: String
  },
  country: {
    type: String
  }
});

Schemas.BillingAccount = new SimpleSchema([Schemas.IsaBase, {
  organisationName: {
    type: String,
    label: "Name",
    isa: {}
  },
  maxStorageMB: {
    type: Number,
    allowedValues: [
      50,
      100,
      200
    ],
    defaultValue: 50
  },
  manualInvoicingState: {
    type: String,
    allowedValues: [
      "none",
      "requested",
      "approved"
    ],
    defaultValue: "none"
  },
  defaultLanguage: {
    type: String,
    allowedValues: [
      'en-GB',
      'en-US'
    ],
    defaultValue: 'en-GB',
    label: "Language"
    // TODO: How do I get isaSchemaForm working with select ?
  },
  isPublicTemplateAdmin: {
    type: Boolean,
    defaultValue: false
  },
  billingDetails: {
    type: Schemas.BillingDetails,
    optional: true
  },
  owner: {
    type: Schemas.IsaUserDoc,
    optional: false
  },
  users: {
    type: [SimpleSchema.RegEx.Id],
    defaultValue: []
  }
}]);

BillingAccounts.attachSchema(Schemas.BillingAccount);
