Organisations = MultiTenancy.organisations;

'use strict';

Schemas.Organisation = new SimpleSchema([Schemas.IsaOwnable, {
  name: {
    type: String
  }
}]);
Organisations.attachSchema(Schemas.Organisation);
