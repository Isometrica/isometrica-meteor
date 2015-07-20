
/**
 * Embedded in Meteor.users.profile and Contacts
 *
 * @author Steve Fortune
 */
Schemas.PhoneNumberSchema = new SimpleSchema({
  number: {
    type: String,
    minCount: 8,
    maxCount: 50,
    regEx: /^\+\d?[0-9-() ]+$/
  },
  type: {
    type: String,
    optional: true
  }
});
