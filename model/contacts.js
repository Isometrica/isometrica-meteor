
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
    type: {
      type: String,
      max : 500,
      label: "Contact Type",
      optional: true,
      isa: {
        fieldType: 'isaOrgAttribute',
        placeholder: 'Enter the contact type.',
        orgOptionKey: 'contactTypes'
      }
    },
    title: {
      type: String,
      label: "Title",
      optional: true,
      max: 500,
      isa: {
        placeholder: 'Enter the contact title.'
      }
    },
    orgName: {
      type: String,
      label: "Organization Name",
      optional: true,
      max: 500,
      isa: {
        fieldType: 'isaCollectionItem',
        collectionNames: ['organisationAddresses'],
        placeholder: 'Enter the contact\'s organization name.'
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
    notes: {
      type: String,
      optional: true,
      label: "Notes / Requirements",
      isa: {
        fieldType: 'isaNotes'
      }
    },
    address: {
      type: String,
      label: "Postal Address",
      optional: true,
      max: 500,
      isa: {
        fieldType: 'isaTextarea',
        placeholder: 'Enter the contact address.'
      }
    }
  }
]);
Contacts.attachSchema(Schemas.Contact);
