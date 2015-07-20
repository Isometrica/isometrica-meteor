Organisations = new Mongo.Collection('organisations');
Schemas.OrganisationSchema = new SimpleSchema([Schemas.IsaBase, {
  name: {
    type: String,
    optional: false
  }
}]);
Organisations.attachSchema(Schemas.OrganisationSchema);

if (Meteor.isServer) {
  Meteor.methods({
    /**
     * Switch the current user's organisation
     *
     * @param orgId String
     */
    switchOrganisation: function(orgId) {
      console.log('Switching to ' + orgId);
      Partitioner.clearUserGroup(this.userId);
      Partitioner.setUserGroup(this.userId, orgId);
    },
    /**
     * Gets the current user's organisatoin
     *
     * @return String
     */
    currentOrganisation: function() {
      var orgId = Partitioner.getUserGroup(this.userId);
      return Organisations.findOne(orgId);
    }
  });
}
