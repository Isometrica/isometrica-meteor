OrganisationSettings = new MultiTenancy.Collection('organisationSettings');
Schemas.OrganisationSettings = new MultiTenancy.Schema([Schemas.IsaBase, {
  meetingTypes: {
    type: [ String ],
    autoValue: function() {
      if (this.isInsert && !this.isSet) {
        return [
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
    }
  }
}]);
OrganisationSettings.attachSchema(Schemas.OrganisationSettings);
OrganisationSettings.allow({
  insert: function() {
    return true;
  },
  update: function() {
    return true;
  }
});
