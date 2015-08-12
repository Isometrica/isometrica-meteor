
AccountSubscriptions = new Mongo.Collection("accountSubscriptions");

'use strict';

AccountSubscriptions.allow({
  insert: function() {
    return true; // TODO: If logged in and they don't already have an account.
  },
  update: function() {
    return true; // TODO: If logged in and they are part of this account and updating attributes that they have access to
  }
});

Schemas.BillingDetails = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: 'Email'
  },
  address: {
    label: 'Address',
    type: String
  },
  city: {
    label: 'City',
    type: String
  },
  zip: {
    label: 'ZIP',
    type: String
  },
  country: {
    label: 'Country',
    type: String
  }
});

Schemas.AccountSubscription = new SimpleSchema([Schemas.IsaOwnable, Schemas.IsaBase, {
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
  defaultCurrency: {
    type: String,
    allowedValues: [
      'Pounds Sterling (£)',
      'Dollars ($)'
    ],
    defaultValue: 'Pounds Sterling (£)',
    label: "Currency"
  },
  isPublicTemplateAdmin: {
    type: Boolean,
    defaultValue: false
  },
  billingDetails: {
    type: Schemas.BillingDetails,
    optional: false
  }
}]);

AccountSubscriptions.attachSchema(Schemas.AccountSubscription);

if (Meteor.isServer) {
  AccountSubscriptions._ensureIndex("owner._id", { unique: 1 });
}
