
/**
 * Not to be confused with the MultiTenancy.organisation collection
 * and attributes defined in Schema.Organisation, OrganisationAddresses
 * are simple, partitioned records that are available in an
 * organisation's address book.
 *
 * @var MultiTenancy.Collection
 * @author Steve Fortune
 */
OrganisationAddresses = new MultiTenancy.Collection("organisationAddresses");

'use strict';

OrganisationAddresses.allow({
  insert: function() {
    return true;
  },
  update: function() {
    return true;
  }
});

Schemas.OrganisationAddress = new MultiTenancy.Schema([Schemas.IsaBase, Schemas.IsaContactable, {
  name: {
    type: String,
    label: 'Name',
    isa: {
      placeholder: 'Enter the organisation name.'
    }
  },
  type: {
    type: String,
    label: "Type",
    optional: true,
    allowedValues: [
      "Supplier",
      "Buyer"
    ]
  },
  address: {
    type: String,
    label: "Address",
    optional: true,
    max: 500,
    isa: {
      placeholder: 'Enter the organisation address.'
    }
  }
}]);
