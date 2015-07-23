Organisations = MultiTenancy.organisations;
Schemas.OrganisationSchema = new SimpleSchema([Schemas.IsaBase, {
  name: {
    type: String,
    optional: false
  }
}]);
Organisations.attachSchema(Schemas.OrganisationSchema);
