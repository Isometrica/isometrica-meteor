
# Multi-Tenancy

An introduction and usage guide for the MultiTenancy module.

### Overview

###### Server

The `MultiTenancy` module defines 2 collections:

- `MultiTenancy.organisations` - groups of `Meteor.users` by which collections are partitioned.
- `MultiTenancy.memberships` - the joining relation between `Meteor.users` and `MultiTenancy.organisations`; its candidate key is: `{ userId, _orgId }`.

The `MultiTenancy.applyConstraints` function applies multi-tenancy access constraints to a given collection. A special `_orgId` attribute is appended onto the documents in the collection, which acts as a partition key and corresponds to the `_id` of the organisation that the document in question belongs to.

The server-side implementation of `MultiTenancy.applyConstraints` applies the following constraints:

- If there is an authenticated user, the collection can be queried.
- A user can find, update or remove a document in a collection if, and only if, a membership exists between the user and the document's owning organisation.
- A user can insert a document in a collection if, and only if, they specify an organisation to which the document belongs and a membership exists between the user and the organisation.
- The organisation to which a document belongs cannot be updated.

These constraints are enforced by adding `find`, `insert` and `update` hooks to the collection:

- `find`:

  - If an `_orgId` is specified in the query selector and a membership does not exist between the current user and an organisation with that `_id`, then a 403 is thrown.
  - If no `_orgId` is specified in the query selector, the `find` query will be constrained only to the organisations that the user has access to, by appending the following psuedo-clause to the selector: `_orgId: { $in: [... <The _orgIds of the user's memberships>] }`. Note that in this case the query will do nothing if you're trying to access a foreign document, rather than throw a 403.
  - [* 1]

- `insert`:

  - If an `_orgId` is not specified, then a 403 is thrown.
  - If an `_orgId` is specified and a membership does not exist between the current user and an organisation with that `_id`, then a 403 is thrown.

- `update`:

  - If an `_orgId` is specified in the modifier's `$set` object, then it is deleted.

[* 2]

The server's approach to publication is typically to publish all documents that a user has access to (i.e. across all of their organisations), so that the client can build a more-specific filter.


[* 1] Note that the `find` hook is called by the `collection-hooks` package for `update` and `remove` operations so there is no need to enforce access constraints in specific `update` or `remove` hooks. The side-effect is, however, that if you don't specify an `_orgId` in your server-side `update` or `remove` calls, the query will not explicitly throw if you don't own the document that you're trying to access.

[* 2] These propositions are extended by <a href="#masquerading">Masquerading</a> operations.

###### Client

In this setup, the server doesn't know actually which organisation a user is accessing. As mentioned before, the server's job is just to assert that the user is reading and writing to an organisation that they are part of.

The client has a different job: to maintain specifically which organisation that the current user is accessing (if any) and append the `_orgId` to queries.

The organisation id that the user is currently accessing is stored in a `Session`. The client also gives you the option of specifying specifically which collections are filtered by the organisation.

The client-side implementation of `MultiTenancy.applyConstraints` applies the following constraints:

- A collection can be queried if, and only if, there is an authenticated user.
- If an organisation is set and either there is no collection filter or the collection is part of the filter, `find`, `update` and `remove` operations will be constrained to that organisation.
- A user can insert documents if, and only if, there is an organisation.

The constraints are enforced by adding `find`, `insert` and `update` hooks to the collection:

- `find`:

  - If there is no current authenticated user, then a 403 is thrown.
  - If  organisation id is set and either there is no collection filter or the collection is included in the filter, the `_orgId` will be appended to the query selector.

- `insert`:

  - If an `_orgId` is not specified, then a 403 is thrown.

- `update`:

  - If an `_orgId` is specified in the modifier's `$set` object, then it is deleted.

Note that `find`, `update` and `remove` operations won't be constrained to an organisation id if one is not set, still allowing you to query across all of your documents.

###### Notes

- Different ways to instantiate a partitioned collection:

  - `MyCollection = Mongo.Collection("myCollection"); MultiTenancy.applyConstraints(MyCollection);`
  - `MyCollection = MultiTenancy.Collection("myCollection");`
  - `MyCollection = new MultiTenancy.Collection("myCollection");`

- Different ways to instantiate a schema for a partitioned collection:

  - `Schemas.MyCollection = new SimpleSchema([MultiTenancy.partitionSchema, {... }]);`
  - `Schemas.MyCollection = MultiTenancy.Schema({... });`
  - `Schemas.MyCollection = new MultiTenancy.Schema({... });`

###### Basic Usage

Simple server / client:

``` Javascript

Documents = new MultiTenancy.Collection("documents");
DocumentsSchema = new MultiTenancy.Schema({
  title: {
    type: String
  },
  body: {
    type: String
  }
});
Documents.attachSchema(DocumentsSchema);
Documents.allow({
  insert: function() {
    return true;
  },
  update: function() {
    return false;
  },
  remove: function() {
    return false;
  }
});

if (!Meteor.isServer) {

  // Finds all documents across all of the current user's organisations
  var findCur = Documents.find({});

  // This will throw because no organisation id is set. How do we know where to put it?
  Documents.insert({ title: "Throw me away", body: "But why?" });
  // Updates documents across _all of the current user's organisations_
  Documents.update({ title: "Could be anything" }, { $set: { body: "Yes it could" } });
  // Removes all docs from all of the current user's organisations
  Documents.remove({});

  // `myOrgId` is assumed to be the id of an organisation that the current user has a membership with.
  // Now the client knows that queries should be constrained to specific organisations
  MultiTenancy.setOrgId(myOrgId);

  // Finds all documents in myOrgId
  var findCur = Documents.find({});
  // Creates the doc as part of `myOrgId`
  Documents.insert({ title: "Beam me up", body: "Scotty" });
  // Updates a doc that's part of `myOrgId`
  Documents.update({ title: "Beam me up" }, { $set: { body: "Someone other than scotty" } });
  // Removes all docs from `myOrgId`
  Documents.remove({});

  // `notMyOrgId` is assumed to be the id of an organisation that the current user does not
  // have a membership with. In this case, the client is blind but the server sees.
  MultiTenancy.setOrgId(notMyOrgId);

  // Will throw a 403 on the server (or return an empty result set)
  var findCur = Documents.find({});
  // Will throw a 403 on the server
  Documents.insert({ title: "Beam me up", body: "Scotty" });
  // Will throw a 403 on the server
  Documents.update({ title: "Beam me up" }, { $set: { body: "Someone other than scotty" } });
  // Will throw a 403 on the server
  Documents.remove({});

}

```

Client with collection filter:

``` Javascript

var allow = {
  insert: function() {
    return true;
  },
  update: function() {
    return false;
  },
  remove: function() {
    return false;
  }
};
CollectionOne = new MultiTenancy.Collection("one");
CollectionTwo = new MultiTenancy.Collection("two");

CollectionOne.allow(allow);
CollectionTwo.allow(allow);

if (!Meteor.isServer) {

  // Only filter CollectionOne by org id !
  MultiTenancy.setFilteredCollections(["one"]);
  MultiTenancy.setOrgId(myOrgId);

  // Will only get CollectionOne documents from myOrgId
  var oneCur = CollectionOne.find({});
  // Will get CollectionTwo documents from all of the current user's organisations
  var twoCur = CollectionTwo.find({});

}

```

### Masquerading

Original constraint:

- If there is an authenticated user, the collection can be queried

Actual constraint:

- The collection can be queried if, and only if, there is an authenticated user or a Masquerade operation is being performed.
- ...


- What is Masquerading?
- When do I use it?
- What's the 'auth' option all about ?
- Usage Example

### Client / Server Methods

- Problem domain
- Simple solution
- How the module makes this easier for you
- Usage Example

### Angular Integration

- State bindings
- mtCall decorator
- Usage Example

### Edge Cases

- Adding / removing user from a group

### Dependencies
