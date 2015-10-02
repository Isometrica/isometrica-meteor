Organisations = MultiTenancy.organisations;

Schemas.Organisation = new SimpleSchema([Schemas.IsaOwnable, {
  name: {
    type: String,
    label: 'Org name'
  },
  mission: {
    type: String,
    isa: {
      fieldType: 'isaRichText'
    }
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
  },
  riskTypes: {
    type: [String],
    defaultValue: [
      'Industrial accident',
      'Strike or stoppage',
      'Technical failure',
      'Transport accident',
      'Severe weather',
      'Human health',
      'Animal health',
      'Public protest',
      'International event'
    ]
  },
  performanceIndicators: {
    type: [String],
    defaultValue: [
      'Management system',
      'Sales',
      'Marketing',
      'Customer service',
      'Manufacturing',
      'Technical support',
      'Operations'
    ]
  },
  managementPrograms: {
    type: [String],
    defaultValue: [
      'Quality Management',
      'Environmental Management',
      'Business Continuity Management',
      'Information Security Management'
    ]
  },
  departments: {
    type: [String],
    defaultValue: [
      'Accounting',
      'HR',
      'Sales',
      'Marketing',
      'Manufacturing',
      'Operations',
      'Customer service',
      'Technical support'
    ]
  },
  supplierTypes: {
    type: [String],
    defaultValue: [
      'Supplier',
      'Outsource partner'
    ]
  },
  customerTypes: {
    type: [String],
    defaultValue: [
      'Customer',
      'Employee',
      'Financial stakeholder',
      'Local community',
      'Legal & regulatory',
      'Outsource partner',
      'Supplier',
      'Trade union'
    ]
  },
  envAspectTypes: {
    type: [String],
    defaultValue: [
      'Use of limited water resources',
      'Use of limited forest resources',
      'Use of other limited natural resources',
      'Use of landfill',
      'Pollution of waterways',
      'Generation of greenhouse gases'
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
