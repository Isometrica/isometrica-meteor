Organisations = MultiTenancy.organisations;

Schemas.Organisation = new SimpleSchema([Schemas.IsaOwnable, {
  name: {
    type: String
  },
  setupViewed: {
    type: [String],
    defaultValue: []
  },
  setupDone: {
    type: [String],
    defaultValue: []
  },
  roles: {
    type: [String],
    defaultValue: [
      "Manager",
      "Staff"
    ]
  },
  contactTypes: {
    type: [String],
    defaultValue: [
      "Customer",
      "Supplier",
      "Partner",
      "Consultant",
      "Internal"
    ]
  },
  meetingTypes: {
    type: [String],
    defaultValue: [
      'Ad Hoc',
      'Weekly Management',
      'Weekly Operations',
      'Weekly Sales',
      'Weekly Support',
      'Monthly Management',
      'Quarterly Management Review',
      '6 Monthly Management Review',
      'Annual Management Review'
    ]
  }
}]);

/**
 * @todo Secure
 */
Organisations.allow({
  update: function() {
    return true;
  }
});
Organisations.attachSchema(Schemas.Organisation);
