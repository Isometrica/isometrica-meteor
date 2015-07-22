
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

var assertClient = function() {
  if (Meteor.isServer) {
    throw new Meteor.Error(404, 'Only available on the client');
  }
};

var assertServer = function() {
  if (!Meteor.isServer) {
    throw new Meteor.Error(404, 'Only available on the server');
  }
};

/**
 * @constructor
 * Proxies Mongo.Collection ctor. Applies multi-tenancy hooks to the
 * collection.
 *
 * @note  No update / remove hooks are required. find / findOne are
 *        called before update and remove anyway.
 * @host  Server | Client
 * @param name String
 * @see   Mongo.Collection
 */
MultiTenancy.Collection = function(name) {

  var col = new Mongo.Collection(name);
  var constrainFind;
  var constrainInsert;

  var assertUser = function(userId) {
    if (!userId) {
      throw new Meteor.Error(403, 'Login required to access multi-tenancy collection');
    }
  };

  if (Meteor.isServer) {

    var findOrgIds = function(userId) {
      return MultiTenancy.memberships.find({
        userId: userId
      }, {
        _orgId: 1
      }).fetch().map(function(mem) {
        return mem._orgId;
      });
    };

    constrainFind = function(userId, sel) {
      sel._orgId = {
        $in: findOrgIds(userId)
      };
    };

    constrainInsert = function(userId, doc) {
      if (!doc._orgId) {
        throw new Meteor.Error(403, 'No orgId! Make sure that have configured the client correctly');
      }
      var orgIds = findOrgIds(userId);
      if(!~orgIds.indexOf(doc._orgId)) {
        throw new Meteor.Error(403, 'User does not have access to this organisation');
      }
    };

  } else {

    constrainFind = function(userId, sel) {
      sel._orgId = MultiTenancy.orgId();
    };

    constrainInsert = function(user, doc) {
      if (!MultiTenancy.orgId()) {
        throw new Meteor.Error(403, 'Set MultiTenancy.orgId()');
      }
      doc._orgId = MultiTenancy.orgId();
    }

  }

  col.before.all(assertUser);
  col.before.insert(constrainInsert);
  col.before.find(constrainFind);
  col.before.findOne(constrainFind);

  return col;

};

/**
 * Get / set the current org id on the client.
 *
 * @param orgId falsy | String
 * @host Client
 */
MultiTenancy.orgId = function(orgId) {
  assertClient();
  var key = 'MultiTenancy.orgId';
  if (orgId) {
    return Session.get(key);
  } else {
    Session.set(key, orgId);
  }
};

/**
 * Collection of different organisations.
 *
 * @todo What on the client ?
 * @host Client | Server
 * @var Mongo.Collection
 */
MultiTenancy.organisations = new Mongo.Collection('organisations');

/**
 * Partitioned collection of memberships of different organisations.
 *
 * @todo What on the client ?
 * @host Client | Server
 * @var MultiTenancy.Collection
 */
MultiTenancy.memberships = new MultiTenancy.Collection('memberships');
