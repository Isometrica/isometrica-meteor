
Contacts = new MultiTenancy.Collection("contacts");

'use strict';

Contacts.allow({
  insert: function() {
    return true;
  },
  remove: function() {
    return true;
  },
  update: function() {
    return true;
  }
});
Schemas.Contact = new MultiTenancy.Schema([Schemas.IsaBase, {
  name: {
    type: String,
    label: 'Name',
    isa: {
      placeholder: 'Enter contact name.',
      focus: true
    }
  }
}]);
Contacts.attachSchema(Schemas.Contact);
