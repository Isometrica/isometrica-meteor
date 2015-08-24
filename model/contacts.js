
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
Schemas.Contact = new MultiTenancy.Schema([
  Schemas.IsaBase,
  Schemas.IsaContactable,
  Schemas.IsaProfilePhoto,
  {
    name: {
      type: String,
      label: 'Name',
      isa: {
        placeholder: 'Enter the contact name.'
      }
    },
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
      label: "Email",
      optional: true,
      max: 500,
      isa: {
        inputType: 'email',
        placeholder: 'Enter the contact email.'
      }
    },
    type: {
      type: String,
      label: "Type",
      optional: true,
      allowedValues: [
        "Internal",
        "External"
      ]
    },
    role: {
      type: String,
      label: "Role",
      optional: true,
      max: 500,
      isa: {
        placeholder: 'Enter the contact role.'
      }
    },
    address: {
      type: String,
      label: "Address",
      optional: true,
      max: 500,
      isa: {
        placeholder: 'Enter the contact address.'
      }
    }
  }
]);
Contacts.attachSchema(Schemas.Contact);
