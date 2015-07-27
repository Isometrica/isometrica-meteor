
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
- A the organisation to which a document belongs cannot be updated.

These constraints are enforced by adding `find`, `insert` and `update` collection hooks to the collection:

- `find`:

  - if an `_orgId` is specified in the query selector, then a 403 is thrown if a membership does not exist between the current user and an organisation with that `_id`.
  - if no `_orgId` is specified in the query selector, the `find` query will be constrained only to the organisations that the user has access to by appending the following psuedo-clause to the selector: `_orgId: { $in: [... <The _orgIds of the user's memberships>] }`. Note that this means the query will do nothing if you're trying to access a foreign document, rather than throw a 403.
  - [* 1]

- `insert`:

  - if an `_orgId` is not specified, then a 403 is thrown.
  - if an `_orgId` is specified, then a 403 is thrown if a membership does not exist between the current user and an organisation that that `_id`.

- `update`:

  - if an `_orgId` is specified in the modifier's `$set` object, then it is deleted.

[* 2]

The server's approach to publication is typically to publish all documents that a user has access to (i.e. across all of their organisations), so that the client can build a more-specific filter.


[* 1] Note that the `find` hook is called by the `collection-hooks` package for `update` and `remove` operations so there is no need to enforce access constraints in specific `update` or `remove` hooks. The side-effect is, however, that if you don't specify an `_orgId` in your server-side `update` or `remove` calls, the query will not explicitly throw if you don't own the document that you're trying to access.

[* 2] These propositions are extended by <a href="#Masquarading">Masquarading</a> operations.


###### Client

In this setup, the server doesn't know actually which organisation a user is accessing. As mentioned before, the server's job is just to assert that the user is reading and writing to an organisation that they are part of.

The client has a different job: to maintain specifically which organisation that the current user is accessing (if any) and append the `_orgId` to queries.

The client-side implementation of `MultiTenancy.applyConstraints` applies the following constraints:

- A collection can be queried if, and only if, there is an authenticated user.
- If an there is an organisation id, `find`, `update` and `remove` operations will be constrained to that organisation.
- A user can insert documents if, and only if, there is an organisation id.

The organisation id that the user is currently accessing is stored in a `Session`.

Note that `find`, `update` and `remove` operations won't be constrained to an organisation id if one is not set, still allowing you to query across all of your documents. The client also given you the option of specifying which collections are filtered by the `find` hook.

###### Basic Usage



### Masquarading

Original constraint:

- If there is an authenticated user, the collection can be queried

Actual constraint:

- The collection can be queried if, and only if, there is an authenticated user or a masquarade operation is being performed.
- ...


- What is masquarading?
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
