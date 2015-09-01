Organisations = MultiTenancy.organisations;

'use strict';

Schemas.Organisation = new SimpleSchema([Schemas.IsaOwnable, {
  name: {
    type: String
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
