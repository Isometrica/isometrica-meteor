
/**
 * Namespace for multitenancy magic. Here's how it works...
 *
 * # Server
 *
 * - All CRUD methods need a current user otherwise 403.
 * - `find`, `findOne`, `update` and `remove` queries are constrained
 *   to where.$in the current user's organisations. Server should
 *   publish all documents that the user has access to across all of
 *   their organisations. Credits to MH for this suggestion.
 * - `insert` must contain an _orgId otherwise 403 (this is added
 *   transparently on the client side insert hook).
 * - `update` 403 if contains _orgId. I.e. users cannot update
 *   the partition key of documents.
 *
 * # Client
 *
 * - Has a global 'currentOrgId' variable stored in a Session.
 * - CRUD collection hooks which add the currentOrgId to all query
 *   selectors as _orgId.
 * - The `currentOrgId` might be updated on `$startRouteChange`
 *   using the $stateParams.
 *
 * # Why not constrain all the queries on the server side?
 *
 * - We need to avoid maintaining state about which specific
 *   organisation a user is viewing on the server side; as its
 *   per-client data it makes sense to maintain it on the client.
 * - Doing so on the server runs into all sorts of design issues
 *   where the same client is viewing different organisations
 *   through different browser windows.
 *
 * # Todos
 *
 * - What if a user is added to an org ?
 *
 * @author Steve Fortune
 */
MultiTenancy = {};

'use strict';

/**
 * @constructor
 * Paraciticly proxies Mongo.Collection ctor. Applies multi-tenancy hooks
 * to the collection.
 *
 * @param name String
 * @see   Mongo.Collection
 */
MultiTenancy.Collection = function(name) {
  var col = new Mongo.Collection(name);
  return col;
};

/**
 *
 */
MultiTenancy.organisation = function() {

};

/**
 * Collection of different host organisations.
 *
 * @var Mongo.Collection
 */
MultiTenancy.organisations = new Mongo.Collection('organisations');

/**
 * Partitioned collection of memberships to different hosts.
 *
 * @var MultiTenancy.Collection
 */
MultiTenancy.memberships = new MultiTenancy.Collection('memberships');
