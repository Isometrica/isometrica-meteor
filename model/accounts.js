
Accounts = new Mongo.Collection("accounts");

'use strict';

Schemas.InvoicingStatus = new SimpleSchema([Schemas.IsaBase, {
  manualInvoicingState: {
    type: String,
    allowedValues: [
      "none",
      "requested",
      "approved"
    ]
  }
}]);

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

Schemas.Account = new SimpleSchema([Schemas.IsaBase, {
  organisationName: {
    type: String
  },
  maxStorageMB: {
    type: Number
  },
  manualInvoicing: {
    type: Schemas.InvoicingStatus
  },
  defaultLanguage: {
    type: String,
    allowedValues: [
      'en-GB',
      'en-US'
    ]
  },
  isPublicTemplateAdmin: {
    type: Boolean,
    defaultValue: false
  },
  billingDetails: {
    type: Schemas.BillingDetails
  },
  users {
    type: [SimpleSchema.RegEx.Id]
  }
}]);

Accounts.attachSchema(Schemas.Account);
