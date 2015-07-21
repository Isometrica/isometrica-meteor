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
      var self = this;
      Partitioner.bindGroup(orgId, function() {
        if (!Meteor.call('membershipExists', self.userId)) {
          throw new Meteor.Error(400, 'Cannot switch to this org');
        }
      });
      Partitioner.clearUserGroup(self.userId);
      Partitioner.setUserGroup(self.userId, orgId);
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
