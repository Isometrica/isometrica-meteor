
Contacts = new MultiTenancy.Collection("contacts");

'use strict';

Schemas.Contact = new MultiTenancy.Schema([Schemas.IsaBase, {
  name: {
    type: String
  }
}]);
Contacts.attachSchema(Schemas.Contact);
