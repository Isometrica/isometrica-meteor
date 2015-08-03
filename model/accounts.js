
BillingAccounts = new Mongo.Collection("accounts");

'use strict';

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
    type: String
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
    defaultValue: 'en-GB'
  },
  isPublicTemplateAdmin: {
    type: Boolean,
    defaultValue: false
  },
  billingDetails: {
    type: Schemas.BillingDetails,
    optional: true
  },
  users: {
    type: [SimpleSchema.RegEx.Id],
    defaultValue: []
  }
}]);

BillingAccounts.attachSchema(Schemas.BillingAccount);
