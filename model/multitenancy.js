
/**
 * Namespace for multitenancy magic. Here's how it works:
 *
 * # Server
 *
 * - All CRUD methods need a current user otherwise 403.
 * - `find`, `findOne`, `update` and `remove` queries are constrained
 *   to where.$in the current user's organisations. Server should
 *   publish all documents that the user has access to across all of
 *   their organisations. Credits to MH for this suggestion.
 * - `insert` doc must have an `_orgId` otherwise 403 (this is added
 *   transparently in the client side's `insert` hook).
 * - `update` shouldn't allow _orgIds to be modified.
 *
 * # Client
 *
 * - Has a global 'currentOrgId' variable stored in a Session.
 * - CRUD collection hooks which append the orgId to all query
 *   selectors.
 * - The `orgId` might be updated on `$startRouteChange`using
 *   the $stateParams.
 *
 * # Why not constrain all the queries on the server side?
 *
 * - We need to avoid maintaining state about which specific
 *   organisation a user is viewing on the server side; as its
 *   per-client data it makes sense to maintain it on the client.
 * - Doing so on the server runs into all sorts of design issues
 *   when the same client is viewing different organisations through
 *   different browser windows.
 *
 * @todo    What if a user is added to an org ?
 * @author  Steve Fortune
 */
MultiTenancy = {};

'use strict';

/**
 * Assert that the application is running on the correct host
 *
 * @throws  Meteor.Error
 * @param   server        Boolean
 */
var assertHost = function(server) {
  if (!!server !== Meteor.isServer) {
    var hostName = (isServer ? 'server' : 'client');
    throw new Meteor.Error(404, 'Only available on the ' + hostName);
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
 * @param name    String
 * @see   Mongo.Collection
 */
MultiTenancy.Collection = function(name) {

  var col = new Mongo.Collection(name);
  var constrainFind;
  var constrainInsert;

  var constrainUpdate = function(userId, doc, fieldNames, modifier) {
    if (modifier.$set) {
      delete modifier.$set._orgId;
    }
  };

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
    };

  }

  col.before.all(assertUser);
  col.before.insert(constrainInsert);
  col.before.update(constrainUpdate);
  col.before.find(constrainFind);
  col.before.findOne(constrainFind);

  return col;

};

/**
 * @constructor
 * Create a schema configured for MultiTenancy. Proxies the SimpleSchema
 * ctor.
 *
 * @param   schemaHeirarchy  Array | Object
 * @return  SimpleSchema
 */
MultiTenancy.Schema = function(schemaHeirarchy) {
  var subSchema;
  if (_.isArray(schemaHeirarchy)) {
    subSchema = _.last(schemaHeirarchy);
  } else if (_.isObject(schemaHeirarchy)) {
    subSchema = schemaHeirarchy;
  } else {
    throw new Error("Unsupported schema type");
  }
  subSchema._orgId = {
    type: String
  };
  return new SimpleSchema(schemaHeirarchy);
};

/**
 * Get / set the current org id on the client.
 *
 * @param orgId falsy | String
 * @host Client
 */
MultiTenancy.orgId = function(orgId) {
  assertHost();
  var key = 'MultiTenancy.orgId';
  if (orgId) {
    return Session.get(key);
  } else {
    Session.set(key, orgId);
  }
};

/**
 * Convenience function. Listens for orgId in $startRouteChange event handler
 * on an angular.js module and updates orgId accordingly.
 *
 * @note  Haven't decided whether this is ugly or convenient to have
 *        the fn here.
 * @host Client
 * @param ng  Angular.module
 */
MultiTenancy.listenOnNgState = function(ng) {
  assertHost();
  ng.run(['$rootScope', '$stateParams', function($rootScope, $stateParams) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
      MultiTenancy.orgId(toStateParams.orgId);
    });
  }]);
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
