Organisations = MultiTenancy.organisations;

'use strict';

Schemas.Organisation = new SimpleSchema({
  name: {
    type: String
  }
});
Organisations.attachSchema(Schemas.Organisation);
