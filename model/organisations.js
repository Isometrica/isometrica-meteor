Organisations = new Mongo.Collection('organisations');

Timestamp(Organisations);

OrganisationSchema = new SimpleSchema({
  name: {
    type: String,
    optional: false
  }
});
