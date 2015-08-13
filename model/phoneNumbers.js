
/**
 * Mixin for entities that have an array of phone numbers.
 *
 * @author Steve Fortune
 */
Schemas.IsaContactable = new SimpleSchema({
  phoneNumbers: {
    type: [Object],
    defaultValue: [],
    optional: true,
    isa: {
        fieldType: 'isaPhoneNumbers'
    }
  },
  'phoneNumbers.$.number': {
    type: String,
    minCount: 8,
    maxCount: 50,
    regEx: /^\+\d?[0-9-() ]+$/,
    label: "Number"
  },
  'phoneNumbers.$.type': {
    type: String,
    allowedValues: [
      "Work",
      "Home",
      "Mobile"
    ],
    label: "Type"
  }
});
