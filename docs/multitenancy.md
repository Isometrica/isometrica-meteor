
# Multi-Tenancy

A usage guide for the `MultiTenancy` module.

### Overview

###### Server

The `MultiTenancy` module defines 2 collections:

- `MultiTenancy.organisations` - groups of `Meteor.users` by which collections are partitioned.
- `MultiTenancy.memberships` - the joining relation between `Meteor.users` and `MultiTenancy.organisations`; its candidate key is: `{ userId, _orgId }`.

The `MultiTenancy.applyConstraints` function applies multi-tenancy access constraints to a given collection. A special `_orgId` attribute is appended onto the documents in the collection, which acts as a partition key and corresponds to the id of the organisation that the document in question belongs to.

The server-side implementation of `MultiTenancy.applyConstraints` applies the following constraints:

- If there is an authenticated user, the collection can be queried.
- A user can find, update or remove a document in a collection iff a membership exists between the user and the document's owning organisation.
- A user can insert a document in a collection iff they specify an organisation to which the document belongs and a membership exists between the user and the organisation.
- The organisation to which a document belongs cannot be updated.

These constraints are enforced by adding `find`, `insert` and `update` hooks to the collection:

- `find`:

  - If no authenticated user, then a 403 is thrown.
  - If an `_orgId` is specified in the query selector and a membership does not exist between the current user and an organisation with that id, then a 403 is thrown.
  - If no `_orgId` is specified in the query selector, the `find` query will be constrained only to the organisations that the user has access to, by appending the following psuedo-clause to the selector: `_orgId: { $in: [... <The _orgIds of the user's memberships>] }`. Note that in this case the query will do nothing if you're trying to access a foreign document, rather than throw a 403.

- `insert`:

  - If no authenticated user, then a 403 is thrown.
  - If an `_orgId` is not specified, then a 403 is thrown.
  - If an `_orgId` is specified and a membership does not exist between the current user and an organisation with that id, then a 403 is thrown.

- `update`:

  - If an `_orgId` is specified in the modifier's `$set` object, then it is deleted.

The server's approach to publication is typically to publish all documents that a user has access to (i.e. across all of their organisations), so that the client can build a more specific filter.

Note that the `find` hook is called by the `collection-hooks` package for `update` and `remove` operations so there is no need to enforce access constraints in specific `update` or `remove` hooks. The side-effect is, however, that if you don't specify an `_orgId` in your server-side `update` or `remove` calls, the query will not explicitly throw if you don't own the document that you're trying to access.

Note that these propositions are extended by <a href="#masquerading">Masquerade</a> operations.

###### Client

In this setup, the server doesn't actually know which organisation a user is accessing; its job is just to assert that the user is reading and writing to an organisation that they are part of.

The client has a different job: to maintain specifically which organisation that the current user is accessing (if any) and append the `_orgId` to queries.

The organisation id that the user is currently accessing is stored in a `Session`. The client also gives you the option of specifying which collections are filtered by the organisation.

The client-side implementation of `MultiTenancy.applyConstraints` applies the following constraints:

- A collection can be queried iff there is an authenticated user.
- If an organisation is set and either there is no collection filter or the collection is part of the filter, `find`, `update` and `remove` operations will be constrained to that organisation.
- A user can insert documents iff there is an organisation.

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

if (Meteor.isClient) {

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

CollectionOne = new MultiTenancy.Collection("one");
CollectionTwo = new MultiTenancy.Collection("two");

if (Meteor.isClient) {

  // Only filter CollectionOne by org id !
  MultiTenancy.setFilteredCollections(["one"]);
  MultiTenancy.setOrgId(myOrgId);

  // Will only get CollectionOne documents from myOrgId
  var oneCur = CollectionOne.find({});
  // Will get CollectionTwo documents from all of the current user's organisations
  var twoCur = CollectionTwo.find({});

}

```

### Client / Server Methods

The server being blind to the client-side state can cause problems. Consider the following method:

```Javascript

Meteor.methods({
  insertSomeDocs: function() {
    for (var i = 1; i <= 3; ++i) {
      Doc.insert({
        title: 'Doc ' + i
      });
    }
  }
});

```

This will work fine on the client side because the `Doc.insert` hook will add the `_orgId`.

It won't work on the server side, though. The server doesn't know about the `_orgId` so it will throw a 403, claiming that you need to provide one.

The obvious solution is just to pass the `_orgId` to the method invokation:

```Javascript

Meteor.methods({
  insertSomeDocs: function(orgId) {
    for (var i = 1; i <= 3; ++i) {
      Doc.insert({
        _orgId: orgId,
        title: 'Doc ' + i
      });
    }
  }
});

if (Meteor.isClient) {

  Meteor.call('insertSomeDocs', myOrgId);
  Meteor.call('insertSomeDocs', myOrgId);
  Meteor.call('insertSomeDocs', myOrgId);

}

```

Perfectly fine solution, but it can get a bit tedious. `MultiTenancy` helps you out with `MultiTenancy.method` and `MultiTenancy.call`:

``` Javascript

Meteor.methods({
  insertSomeDocs: MultiTenancy.method(function() { // Note that we're wrapping the method up
    for (var i = 1; i <= 3; ++i) {
      Doc.insert({
        _orgId: orgId,
        title: 'Doc ' + i
      });
    }
  })
});

if (Meteor.isClient) {

  MultiTenancy.setOrgId(myOrgId);

  MultiTenancy.call("insertSomeDocs");
  MultiTenancy.call("insertSomeDocs");
  MultiTenancy.call("insertSomeDocs");

}

```

Or, if you want to define a group of MultiTenancy methods all at once:

``` Javascript

Meteor.mtMethods({
  aMethod: function() {}
  anotherMethod: function() {}
  ...
});

```

### Masquerading

Sometimes, on the server-side we want to masquerade as a particular organisation. For example, in a boot script we might want to add a set of documents to an example organisation.

<a href="#server">Original proposition</a>: if there is an authenticated user, the collection can be queried.

Actual proposition: the collection can be queried if, and only if, there is an authenticated user or a Masquerade operation is being performed.

There are 2 types of masquerade operation:

- Authorized: still checks whether the current user can perform the query against the organisation.
- Unauthorized: bypasses the access constraints entirely.

###### When would I use it?

- Code that the server runs, which doesn't need to be authorized, e.g. a boot script.
- Code that a user runs in a method on the server-side which relates to particular organisation. In this case you should remember to set the `auth` param to `true` in the `masqOp`, which performs authorizations against the current user.

###### Basic Usage

`masqOp` in a boot script:

``` Javascript

var orgId = Organisations.insert({
  name: org.name
});
MultiTenancy.masqOp(orgId, function() {
  for (var i = 1; i <= 3; ++i) {
    Modules.insert({
      title: org.name + ' Module ' + i,
      type: 'docwiki'
    });
  }
});

```

`masqOp` in a server side method:

``` Javascript

  if (Meteor.isServer) {
    Meteor.methods({
      // Method that copies a document between organisations
      copyDocBetweenOrgs: function(docId, srcOrgId, dstOrgId) {
        var doc;
        // Masquerade as the source organisation to find the doc
        MultiTenancy.masqOp(srcOrgId, function() {
          doc = Docs.findOne(docId);
        }, true);
        if (!doc) {
          throw new Meteor.Error(404, "Doc with id " + docId + " does not exist in org with id " + srcOrgId);
        }
        // Sanatize the doc for copying.
        delete doc._id;
        delete doc._orgId;
        // Masquerade as the destination organisation to insert the doc
        MultiTenancy.masqOp(dstOrgId, function() {
          Docs.insert(doc);
        }, true);
      }
    });
  }

```

### Angular Integration

- State bindings
- mtCall decorator
- Usage Example

### Edge Cases and Todos

- Doesn't check whether the membership is `active` or not. Just that it exists. This is left up to the `allow` impl.
- Adding / removing user from a group.
- Ensure a unqie index on the `memberships` composite key.

### Dependencies
