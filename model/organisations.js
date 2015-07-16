Organisations = new Mongo.Collection('organisations');
OrganisationSchema = new SimpleSchema({
  name: {
    type: String,
    optional: false
  }
});
Base(Organisations, OrganisationSchema);

Meteor.methods({

  /**
   * Switch the current user's organisation
   *
   * @param orgId String
   */
  switchOrganisation: function(orgId) {
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
