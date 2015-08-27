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
Organisations.attachSchema(Schemas.Organisation);
