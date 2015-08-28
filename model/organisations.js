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
